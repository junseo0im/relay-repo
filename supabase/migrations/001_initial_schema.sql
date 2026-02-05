-- StoryRelay Supabase Initial Schema
-- Supabase SQL Editor에 바로 적용 가능

-- ============================================
-- 1. profiles (auth.users 확장)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  preferred_genres text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. challenges
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'ended')),
  participants int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. story_rooms
-- ============================================
CREATE TABLE IF NOT EXISTS public.story_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  genre text NOT NULL DEFAULT '자유' CHECK (genre IN ('자유', '판타지', 'SF', '로맨스', '공포')),
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  preview text,
  cover_image text,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
  current_lock_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lock_expire_at timestamptz,
  like_count int DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  total_authors int DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_story_rooms_genre ON public.story_rooms(genre);
CREATE INDEX idx_story_rooms_is_completed ON public.story_rooms(is_completed);
CREATE INDEX idx_story_rooms_challenge_id ON public.story_rooms(challenge_id);
CREATE INDEX idx_story_rooms_created_at ON public.story_rooms(created_at DESC);

-- ============================================
-- 4. story_turns
-- ============================================
CREATE TABLE IF NOT EXISTS public.story_turns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.story_rooms(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  turn_index int NOT NULL,
  like_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_story_turns_room_id ON public.story_turns(room_id);
CREATE INDEX idx_story_turns_author_id ON public.story_turns(author_id);

-- ============================================
-- 5. story_likes
-- ============================================
CREATE TABLE IF NOT EXISTS public.story_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.story_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_story_likes_room_id ON public.story_likes(room_id);
CREATE INDEX idx_story_likes_user_id ON public.story_likes(user_id);

-- ============================================
-- 6. turn_likes
-- ============================================
CREATE TABLE IF NOT EXISTS public.turn_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turn_id uuid NOT NULL REFERENCES public.story_turns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(turn_id, user_id)
);

CREATE INDEX idx_turn_likes_turn_id ON public.turn_likes(turn_id);
CREATE INDEX idx_turn_likes_user_id ON public.turn_likes(user_id);

-- ============================================
-- 7. challenge_stories
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.story_rooms(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, room_id)
);

CREATE INDEX idx_challenge_stories_challenge_id ON public.challenge_stories(challenge_id);

-- ============================================
-- 8. challenge_winners
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.story_rooms(id) ON DELETE CASCADE,
  rank int NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, rank)
);

CREATE INDEX idx_challenge_winners_challenge_id ON public.challenge_winners(challenge_id);

-- ============================================
-- 9. user_badges
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);

-- ============================================
-- 10. epilogues
-- ============================================
CREATE TABLE IF NOT EXISTS public.epilogues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.story_rooms(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  like_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_epilogues_room_id ON public.epilogues(room_id);

-- ============================================
-- RLS 활성화
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turn_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epilogues ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책: profiles (공개 읽기, 본인만 수정)
-- ============================================
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- RLS 정책: challenges (공개 읽기)
-- ============================================
CREATE POLICY "challenges_select_all" ON public.challenges
  FOR SELECT USING (true);

CREATE POLICY "challenges_insert_admin" ON public.challenges
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "challenges_update_admin" ON public.challenges
  FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================
-- RLS 정책: story_rooms
-- ============================================
CREATE POLICY "story_rooms_select_all" ON public.story_rooms
  FOR SELECT USING (true);

CREATE POLICY "story_rooms_insert_auth" ON public.story_rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "story_rooms_update_creator" ON public.story_rooms
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- RLS 정책: story_turns
-- ============================================
CREATE POLICY "story_turns_select_all" ON public.story_turns
  FOR SELECT USING (true);

CREATE POLICY "story_turns_insert_auth" ON public.story_turns
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "story_turns_update_author" ON public.story_turns
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "story_turns_delete_author" ON public.story_turns
  FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- RLS 정책: story_likes
-- ============================================
CREATE POLICY "story_likes_select_all" ON public.story_likes
  FOR SELECT USING (true);

CREATE POLICY "story_likes_insert_auth" ON public.story_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "story_likes_delete_own" ON public.story_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS 정책: turn_likes
-- ============================================
CREATE POLICY "turn_likes_select_all" ON public.turn_likes
  FOR SELECT USING (true);

CREATE POLICY "turn_likes_insert_auth" ON public.turn_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "turn_likes_delete_own" ON public.turn_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS 정책: challenge_stories
-- ============================================
CREATE POLICY "challenge_stories_select_all" ON public.challenge_stories
  FOR SELECT USING (true);

CREATE POLICY "challenge_stories_insert_auth" ON public.challenge_stories
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- RLS 정책: challenge_winners
-- ============================================
CREATE POLICY "challenge_winners_select_all" ON public.challenge_winners
  FOR SELECT USING (true);

CREATE POLICY "challenge_winners_insert_admin" ON public.challenge_winners
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- RLS 정책: user_badges
-- ============================================
CREATE POLICY "user_badges_select_all" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "user_badges_insert_admin" ON public.user_badges
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- RLS 정책: epilogues
-- ============================================
CREATE POLICY "epilogues_select_all" ON public.epilogues
  FOR SELECT USING (true);

CREATE POLICY "epilogues_insert_auth" ON public.epilogues
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "epilogues_update_author" ON public.epilogues
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "epilogues_delete_author" ON public.epilogues
  FOR DELETE USING (author_id = auth.uid());

-- ============================================
-- profiles: auth.users 트리거 (회원가입 시 자동 생성)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', '사용자'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
