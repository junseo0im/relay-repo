-- StoryRelay RPC Functions
-- Lock, Turn 제출, 좋아요 토글 (SECURITY DEFINER로 RLS 우회)
--
-- 적용: Supabase Dashboard > SQL Editor에서 이 파일 내용 복사 후 실행

-- ============================================
-- 1. check_and_acquire_lock
-- room_id, user_id로 Lock 획득 시도
-- 반환: JSONB { success, lock_expire_at?, current_lock_user_id?, message? }
-- ============================================
CREATE OR REPLACE FUNCTION public.check_and_acquire_lock(
  room_id uuid,
  user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room record;
  v_lock_expire timestamptz;
BEGIN
  -- room 존재 및 미완성 확인
  SELECT id, current_lock_user_id, lock_expire_at, is_completed
  INTO v_room
  FROM story_rooms
  WHERE id = check_and_acquire_lock.room_id;

  IF v_room IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', '스토리를 찾을 수 없습니다.');
  END IF;

  IF v_room.is_completed THEN
    RETURN jsonb_build_object('success', false, 'message', '이미 완성된 스토리입니다.');
  END IF;

  -- Lock이 없거나 만료된 경우 획득
  IF v_room.current_lock_user_id IS NULL OR v_room.lock_expire_at < now() THEN
    v_lock_expire := now() + interval '5 minutes';
    UPDATE story_rooms
    SET current_lock_user_id = check_and_acquire_lock.user_id,
        lock_expire_at = v_lock_expire,
        updated_at = now()
    WHERE id = check_and_acquire_lock.room_id;

    RETURN jsonb_build_object(
      'success', true,
      'lock_expire_at', v_lock_expire
    );
  END IF;

  -- 이미 본인이 Lock 보유
  IF v_room.current_lock_user_id = check_and_acquire_lock.user_id THEN
    RETURN jsonb_build_object(
      'success', true,
      'lock_expire_at', v_room.lock_expire_at
    );
  END IF;

  -- 다른 사용자가 Lock 보유 중
  RETURN jsonb_build_object(
    'success', false,
    'message', '다른 사용자가 작성 중입니다.',
    'current_lock_user_id', v_room.current_lock_user_id,
    'lock_expire_at', v_room.lock_expire_at
  );
END;
$$;

-- ============================================
-- 2. submit_turn
-- Lock 검증 후 턴 INSERT, story_rooms 업데이트
-- 반환: JSONB { success, turn_id?, message? }
-- ============================================
CREATE OR REPLACE FUNCTION public.submit_turn(
  room_id uuid,
  user_id uuid,
  content text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room record;
  v_next_index int;
  v_new_turn_id uuid;
  v_preview text;
BEGIN
  -- content 검증
  IF submit_turn.content IS NULL OR trim(submit_turn.content) = '' THEN
    RETURN jsonb_build_object('success', false, 'message', '내용을 입력해주세요.');
  END IF;

  IF length(submit_turn.content) > 500 THEN
    RETURN jsonb_build_object('success', false, 'message', '500자 이내로 작성해주세요.');
  END IF;

  -- room 및 Lock 확인
  SELECT id, current_lock_user_id, lock_expire_at, is_completed
  INTO v_room
  FROM story_rooms
  WHERE id = submit_turn.room_id
  FOR UPDATE;

  IF v_room IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', '스토리를 찾을 수 없습니다.');
  END IF;

  IF v_room.is_completed THEN
    RETURN jsonb_build_object('success', false, 'message', '이미 완성된 스토리입니다.');
  END IF;

  IF v_room.current_lock_user_id IS NULL OR v_room.current_lock_user_id != submit_turn.user_id THEN
    RETURN jsonb_build_object('success', false, 'message', '작성 권한이 없습니다. Lock을 먼저 획득해주세요.');
  END IF;

  IF v_room.lock_expire_at < now() THEN
    RETURN jsonb_build_object('success', false, 'message', '작성 시간이 만료되었습니다. 다시 시도해주세요.');
  END IF;

  -- turn_index 계산
  SELECT COALESCE(MAX(turn_index), 0) + 1 INTO v_next_index
  FROM story_turns
  WHERE room_id = submit_turn.room_id;

  -- story_turns INSERT
  INSERT INTO story_turns (room_id, author_id, content, turn_index)
  VALUES (submit_turn.room_id, submit_turn.user_id, trim(submit_turn.content), v_next_index)
  RETURNING id INTO v_new_turn_id;

  -- preview: 새 턴 내용 앞 200자
  v_preview := left(trim(submit_turn.content), 200);

  -- story_rooms 업데이트: Lock 해제, preview, total_authors
  UPDATE story_rooms
  SET
    current_lock_user_id = NULL,
    lock_expire_at = NULL,
    preview = v_preview,
    total_authors = (
      SELECT count(DISTINCT author_id)::int
      FROM story_turns
      WHERE room_id = submit_turn.room_id
    ),
    updated_at = now()
  WHERE id = submit_turn.room_id;

  RETURN jsonb_build_object('success', true, 'turn_id', v_new_turn_id);
END;
$$;

-- ============================================
-- 3. toggle_turn_like
-- turn_likes INSERT/DELETE, story_turns.like_count 갱신
-- 반환: JSONB { success, liked, like_count }
-- ============================================
CREATE OR REPLACE FUNCTION public.toggle_turn_like(
  turn_id uuid,
  user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_liked boolean;
  v_count int;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM turn_likes
    WHERE turn_likes.turn_id = toggle_turn_like.turn_id AND turn_likes.user_id = toggle_turn_like.user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM turn_likes WHERE turn_likes.turn_id = toggle_turn_like.turn_id AND turn_likes.user_id = toggle_turn_like.user_id;
    UPDATE story_turns SET like_count = greatest(0, like_count - 1) WHERE id = toggle_turn_like.turn_id;
    v_liked := false;
  ELSE
    INSERT INTO turn_likes (turn_id, user_id) VALUES (toggle_turn_like.turn_id, toggle_turn_like.user_id);
    UPDATE story_turns SET like_count = like_count + 1 WHERE id = toggle_turn_like.turn_id;
    v_liked := true;
  END IF;

  SELECT like_count INTO v_count FROM story_turns WHERE id = toggle_turn_like.turn_id;

  RETURN jsonb_build_object('success', true, 'liked', v_liked, 'like_count', v_count);
END;
$$;

-- ============================================
-- 4. toggle_story_like
-- story_likes INSERT/DELETE, story_rooms.like_count 갱신
-- 반환: JSONB { success, liked, like_count }
-- ============================================
CREATE OR REPLACE FUNCTION public.toggle_story_like(
  room_id uuid,
  user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_liked boolean;
  v_count int;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM story_likes
    WHERE story_likes.room_id = toggle_story_like.room_id AND story_likes.user_id = toggle_story_like.user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM story_likes WHERE story_likes.room_id = toggle_story_like.room_id AND story_likes.user_id = toggle_story_like.user_id;
    UPDATE story_rooms SET like_count = greatest(0, like_count - 1) WHERE id = toggle_story_like.room_id;
    v_liked := false;
  ELSE
    INSERT INTO story_likes (room_id, user_id) VALUES (toggle_story_like.room_id, toggle_story_like.user_id);
    UPDATE story_rooms SET like_count = like_count + 1 WHERE id = toggle_story_like.room_id;
    v_liked := true;
  END IF;

  SELECT like_count INTO v_count FROM story_rooms WHERE id = toggle_story_like.room_id;

  RETURN jsonb_build_object('success', true, 'liked', v_liked, 'like_count', v_count);
END;
$$;
