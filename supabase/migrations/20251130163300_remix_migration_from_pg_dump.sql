CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'faculty',
    'student'
);


--
-- Name: question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_type AS ENUM (
    'mcq',
    'truefalse',
    'short',
    'descriptive',
    'image'
);


--
-- Name: test_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.test_type AS ENUM (
    'mcq',
    'descriptive',
    'mixed'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: answers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    question_id uuid NOT NULL,
    student_answer text,
    is_correct boolean,
    marks_awarded integer DEFAULT 0,
    graded_by uuid,
    graded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: monitoring_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monitoring_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    event_type text NOT NULL,
    event_data jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT monitoring_logs_event_type_check CHECK ((event_type = ANY (ARRAY['fullscreen_exit'::text, 'tab_switch'::text, 'face_not_detected'::text, 'multiple_faces'::text, 'phone_detected'::text, 'background_app_detected'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid NOT NULL,
    question_type public.question_type NOT NULL,
    question_text text NOT NULL,
    question_image_url text,
    options jsonb,
    correct_answer text,
    marks integer DEFAULT 1 NOT NULL,
    order_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: test_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    test_id uuid NOT NULL,
    student_id uuid NOT NULL,
    total_marks integer NOT NULL,
    marks_obtained integer DEFAULT 0 NOT NULL,
    percentage numeric(5,2) DEFAULT 0 NOT NULL,
    grade text,
    is_passed boolean DEFAULT false NOT NULL,
    evaluated_by uuid,
    evaluated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: test_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.test_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    test_id uuid NOT NULL,
    student_id uuid NOT NULL,
    status text DEFAULT 'not_started'::text NOT NULL,
    started_at timestamp with time zone,
    submitted_at timestamp with time zone,
    total_warnings integer DEFAULT 0 NOT NULL,
    tab_switch_count integer DEFAULT 0 NOT NULL,
    fullscreen_exit_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT test_sessions_status_check CHECK ((status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text, 'submitted'::text, 'terminated'::text])))
);


--
-- Name: tests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    subject text NOT NULL,
    test_type public.test_type DEFAULT 'mixed'::public.test_type NOT NULL,
    test_id text NOT NULL,
    duration_minutes integer NOT NULL,
    total_marks integer DEFAULT 0 NOT NULL,
    passing_marks integer DEFAULT 0 NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    enable_monitoring boolean DEFAULT true NOT NULL,
    warning_threshold integer DEFAULT 3 NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: answers answers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: answers answers_session_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_session_id_question_id_key UNIQUE (session_id, question_id);


--
-- Name: monitoring_logs monitoring_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitoring_logs
    ADD CONSTRAINT monitoring_logs_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: test_results test_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_pkey PRIMARY KEY (id);


--
-- Name: test_results test_results_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_session_id_key UNIQUE (session_id);


--
-- Name: test_sessions test_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_pkey PRIMARY KEY (id);


--
-- Name: test_sessions test_sessions_test_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_test_id_student_id_key UNIQUE (test_id, student_id);


--
-- Name: tests tests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_pkey PRIMARY KEY (id);


--
-- Name: tests tests_test_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tests
    ADD CONSTRAINT tests_test_id_key UNIQUE (test_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_answers_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_answers_session_id ON public.answers USING btree (session_id);


--
-- Name: idx_monitoring_logs_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_monitoring_logs_session_id ON public.monitoring_logs USING btree (session_id);


--
-- Name: idx_questions_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_questions_test_id ON public.questions USING btree (test_id);


--
-- Name: idx_test_results_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_results_student_id ON public.test_results USING btree (student_id);


--
-- Name: idx_test_sessions_student_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_sessions_student_id ON public.test_sessions USING btree (student_id);


--
-- Name: idx_test_sessions_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_test_sessions_test_id ON public.test_sessions USING btree (test_id);


--
-- Name: idx_tests_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tests_created_by ON public.tests USING btree (created_by);


--
-- Name: idx_tests_test_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tests_test_id ON public.tests USING btree (test_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: answers update_answers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tests update_tests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: answers answers_graded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_graded_by_fkey FOREIGN KEY (graded_by) REFERENCES public.profiles(id);


--
-- Name: answers answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


--
-- Name: answers answers_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answers
    ADD CONSTRAINT answers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.test_sessions(id) ON DELETE CASCADE;


--
-- Name: monitoring_logs monitoring_logs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitoring_logs
    ADD CONSTRAINT monitoring_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.test_sessions(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: questions questions_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_evaluated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_evaluated_by_fkey FOREIGN KEY (evaluated_by) REFERENCES public.profiles(id);


--
-- Name: test_results test_results_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.test_sessions(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: test_results test_results_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_results
    ADD CONSTRAINT test_results_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: test_sessions test_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: test_sessions test_sessions_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.test_sessions
    ADD CONSTRAINT test_sessions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: questions Allow public delete on questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete on questions" ON public.questions FOR DELETE USING (true);


--
-- Name: tests Allow public delete on tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete on tests" ON public.tests FOR DELETE USING (true);


--
-- Name: questions Allow public insert on questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert on questions" ON public.questions FOR INSERT WITH CHECK (true);


--
-- Name: tests Allow public insert on tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public insert on tests" ON public.tests FOR INSERT WITH CHECK (true);


--
-- Name: questions Allow public update on questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update on questions" ON public.questions FOR UPDATE USING (true);


--
-- Name: tests Allow public update on tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update on tests" ON public.tests FOR UPDATE USING (true);


--
-- Name: questions Everyone can view questions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view questions" ON public.questions FOR SELECT TO authenticated USING (true);


--
-- Name: tests Everyone can view tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view tests" ON public.tests FOR SELECT TO authenticated USING (true);


--
-- Name: tests Faculty and admins can create tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Faculty and admins can create tests" ON public.tests FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: tests Faculty can delete own tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Faculty can delete own tests" ON public.tests FOR DELETE TO authenticated USING (((created_by = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: questions Faculty can manage questions for their tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Faculty can manage questions for their tests" ON public.questions TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.tests
  WHERE ((tests.id = questions.test_id) AND ((tests.created_by = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: test_results Faculty can manage results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Faculty can manage results" ON public.test_results TO authenticated USING ((public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: tests Faculty can update own tests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Faculty can update own tests" ON public.tests FOR UPDATE TO authenticated USING (((created_by = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: monitoring_logs Students and faculty can view monitoring logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students and faculty can view monitoring logs" ON public.monitoring_logs FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = monitoring_logs.session_id) AND ((test_sessions.student_id = auth.uid()) OR public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: monitoring_logs Students can create monitoring logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can create monitoring logs" ON public.monitoring_logs FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = monitoring_logs.session_id) AND (test_sessions.student_id = auth.uid())))));


--
-- Name: test_sessions Students can create own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can create own sessions" ON public.test_sessions FOR INSERT TO authenticated WITH CHECK ((student_id = auth.uid()));


--
-- Name: answers Students can submit answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can submit answers" ON public.answers FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = answers.session_id) AND (test_sessions.student_id = auth.uid())))));


--
-- Name: answers Students can update own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can update own answers" ON public.answers FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = answers.session_id) AND ((test_sessions.student_id = auth.uid()) OR public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: test_sessions Students can update own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can update own sessions" ON public.test_sessions FOR UPDATE TO authenticated USING (((student_id = auth.uid()) OR public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: answers Students can view own answers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view own answers" ON public.answers FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.test_sessions
  WHERE ((test_sessions.id = answers.session_id) AND ((test_sessions.student_id = auth.uid()) OR public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))))));


--
-- Name: test_results Students can view own results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view own results" ON public.test_results FOR SELECT TO authenticated USING (((student_id = auth.uid()) OR public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: test_sessions Students can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view own sessions" ON public.test_sessions FOR SELECT TO authenticated USING (((student_id = auth.uid()) OR public.has_role(auth.uid(), 'faculty'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: profiles Users can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: test_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


