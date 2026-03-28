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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    agent_id character varying NOT NULL,
    status character varying DEFAULT 'idle'::character varying NOT NULL,
    llm_model character varying,
    workspace character varying,
    uptime_since timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    approval_type character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    risk_level character varying DEFAULT 'medium'::character varying NOT NULL,
    context jsonb DEFAULT '{}'::jsonb,
    requested_at timestamp(6) without time zone NOT NULL,
    resolved_at timestamp(6) without time zone,
    agent_id uuid,
    resolved_by_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying NOT NULL,
    value jsonb DEFAULT '{}'::jsonb,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: solid_cable_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solid_cable_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    channel bytea NOT NULL,
    payload bytea NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    channel_hash bigint NOT NULL
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_id character varying NOT NULL,
    title character varying NOT NULL,
    description text,
    status character varying DEFAULT 'backlog'::character varying NOT NULL,
    priority integer DEFAULT 2 NOT NULL,
    agent_id uuid,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: usage_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usage_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid NOT NULL,
    input_tokens integer DEFAULT 0 NOT NULL,
    output_tokens integer DEFAULT 0 NOT NULL,
    api_calls integer DEFAULT 0 NOT NULL,
    cost_cents integer DEFAULT 0 NOT NULL,
    llm_model character varying,
    recorded_at timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    latency_ms integer,
    endpoint character varying
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying NOT NULL,
    remember_created_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: solid_cable_messages solid_cable_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solid_cable_messages
    ADD CONSTRAINT solid_cable_messages_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: usage_records usage_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_records
    ADD CONSTRAINT usage_records_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: index_agents_on_agent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_agents_on_agent_id ON public.agents USING btree (agent_id);


--
-- Name: index_agents_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_agents_on_status ON public.agents USING btree (status);


--
-- Name: index_approvals_on_agent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_approvals_on_agent_id ON public.approvals USING btree (agent_id);


--
-- Name: index_approvals_on_approval_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_approvals_on_approval_type ON public.approvals USING btree (approval_type);


--
-- Name: index_approvals_on_resolved_by_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_approvals_on_resolved_by_id ON public.approvals USING btree (resolved_by_id);


--
-- Name: index_approvals_on_risk_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_approvals_on_risk_level ON public.approvals USING btree (risk_level);


--
-- Name: index_approvals_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_approvals_on_status ON public.approvals USING btree (status);


--
-- Name: index_settings_on_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_settings_on_key ON public.settings USING btree (key);


--
-- Name: index_solid_cable_messages_on_channel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_solid_cable_messages_on_channel ON public.solid_cable_messages USING btree (channel);


--
-- Name: index_solid_cable_messages_on_channel_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_solid_cable_messages_on_channel_hash ON public.solid_cable_messages USING btree (channel_hash);


--
-- Name: index_solid_cable_messages_on_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_solid_cable_messages_on_created_at ON public.solid_cable_messages USING btree (created_at);


--
-- Name: index_tasks_on_agent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_agent_id ON public.tasks USING btree (agent_id);


--
-- Name: index_tasks_on_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_priority ON public.tasks USING btree (priority);


--
-- Name: index_tasks_on_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_tasks_on_status ON public.tasks USING btree (status);


--
-- Name: index_tasks_on_task_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_tasks_on_task_id ON public.tasks USING btree (task_id);


--
-- Name: index_usage_records_on_agent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_usage_records_on_agent_id ON public.usage_records USING btree (agent_id);


--
-- Name: index_usage_records_on_agent_id_and_recorded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_usage_records_on_agent_id_and_recorded_at ON public.usage_records USING btree (agent_id, recorded_at);


--
-- Name: index_usage_records_on_endpoint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_usage_records_on_endpoint ON public.usage_records USING btree (endpoint);


--
-- Name: index_usage_records_on_recorded_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_usage_records_on_recorded_at ON public.usage_records USING btree (recorded_at);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: approvals fk_rails_69267585aa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT fk_rails_69267585aa FOREIGN KEY (resolved_by_id) REFERENCES public.users(id);


--
-- Name: approvals fk_rails_96f563a850; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT fk_rails_96f563a850 FOREIGN KEY (agent_id) REFERENCES public.agents(id);


--
-- Name: usage_records fk_rails_a19e74fe2d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usage_records
    ADD CONSTRAINT fk_rails_a19e74fe2d FOREIGN KEY (agent_id) REFERENCES public.agents(id);


--
-- Name: tasks fk_rails_ffa0a54871; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT fk_rails_ffa0a54871 FOREIGN KEY (agent_id) REFERENCES public.agents(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20260328045534'),
('20260327152056'),
('20260327152055'),
('20260327152054'),
('20260327152053'),
('20260327152046'),
('20260326015751'),
('20260326015105'),
('20260326015036');

