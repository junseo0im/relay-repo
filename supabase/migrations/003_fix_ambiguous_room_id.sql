-- Fix: column reference "room_id" is ambiguous
-- submit_turn 내부 서브쿼리에서 story_turns.room_id 명시

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
  v_room_id uuid := submit_turn.room_id;
BEGIN
  IF submit_turn.content IS NULL OR trim(submit_turn.content) = '' THEN
    RETURN jsonb_build_object('success', false, 'message', '내용을 입력해주세요.');
  END IF;

  IF length(submit_turn.content) > 500 THEN
    RETURN jsonb_build_object('success', false, 'message', '500자 이내로 작성해주세요.');
  END IF;

  SELECT id, current_lock_user_id, lock_expire_at, is_completed
  INTO v_room
  FROM story_rooms
  WHERE id = v_room_id
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

  SELECT COALESCE(MAX(story_turns.turn_index), 0) + 1 INTO v_next_index
  FROM story_turns
  WHERE story_turns.room_id = v_room_id;

  INSERT INTO story_turns (room_id, author_id, content, turn_index)
  VALUES (v_room_id, submit_turn.user_id, trim(submit_turn.content), v_next_index)
  RETURNING id INTO v_new_turn_id;

  v_preview := left(trim(submit_turn.content), 200);

  UPDATE story_rooms
  SET
    current_lock_user_id = NULL,
    lock_expire_at = NULL,
    preview = v_preview,
    total_authors = (
      SELECT count(DISTINCT st.author_id)::int
      FROM story_turns st
      WHERE st.room_id = v_room_id
    ),
    updated_at = now()
  WHERE story_rooms.id = v_room_id;

  RETURN jsonb_build_object('success', true, 'turn_id', v_new_turn_id);
END;
$$;
