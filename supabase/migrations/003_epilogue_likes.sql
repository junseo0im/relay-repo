-- Epilogue Likes
-- epilogue_likes 테이블 + toggle_epilogue_like RPC

-- ============================================
-- 1. epilogue_likes 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.epilogue_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  epilogue_id uuid NOT NULL REFERENCES public.epilogues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(epilogue_id, user_id)
);

CREATE INDEX idx_epilogue_likes_epilogue_id ON public.epilogue_likes(epilogue_id);
CREATE INDEX idx_epilogue_likes_user_id ON public.epilogue_likes(user_id);

ALTER TABLE public.epilogue_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "epilogue_likes_select_all" ON public.epilogue_likes
  FOR SELECT USING (true);

CREATE POLICY "epilogue_likes_insert_auth" ON public.epilogue_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "epilogue_likes_delete_own" ON public.epilogue_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. toggle_epilogue_like RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.toggle_epilogue_like(
  p_epilogue_id uuid,
  p_user_id uuid
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
    SELECT 1 FROM epilogue_likes
    WHERE epilogue_id = p_epilogue_id AND user_id = p_user_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM epilogue_likes WHERE epilogue_id = p_epilogue_id AND user_id = p_user_id;
    UPDATE epilogues SET like_count = greatest(0, like_count - 1) WHERE id = p_epilogue_id;
    v_liked := false;
  ELSE
    INSERT INTO epilogue_likes (epilogue_id, user_id) VALUES (p_epilogue_id, p_user_id);
    UPDATE epilogues SET like_count = like_count + 1 WHERE id = p_epilogue_id;
    v_liked := true;
  END IF;

  SELECT like_count INTO v_count FROM epilogues WHERE id = p_epilogue_id;

  RETURN jsonb_build_object('success', true, 'liked', v_liked, 'like_count', v_count);
END;
$$;
