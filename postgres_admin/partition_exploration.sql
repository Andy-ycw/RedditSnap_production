-- Task 1: Compare query efficiency before/after dropping btree index in sub_ts


-- 1. Create a new table with desirable schema
CREATE TABLE public.submission_time_series_new (
	id varchar NOT NULL,
	observed_tstz timestamptz NOT NULL,
	ups int4 NULL,
	upvote_ratio numeric(3, 2) NULL,
	num_comments int4 NULL
) partition by hash(id);
ALTER TABLE public.submission_time_series_new ADD CONSTRAINT submission_time_series_new_id_fkey FOREIGN KEY (id) REFERENCES public.submission(id);
insert into submission_time_series_new (id, observed_tstz, ups, upvote_ratio, num_comments) select * from submission_time_series;
CREATE INDEX "idx_observation_time_w/timezone2" ON public.submission_time_series_new USING brin (observed_tstz);

explain analyse select * from submission_time_series where id='1fm3w10';
explain analyse select * from submission_time_series_new where id='1fm3w10';

explain analyse select * from submission_time_series where id='1fm3w10';
explain analyse select * from submission_time_series limit 1;

--insert into submission_time_series_new (id, observed_tstz, ups, upvote_ratio, num_comments) values ('1fh3x7', '2024-09-15 15:57:11.538 +1000', '126', '0.97', '13');
select * from submission_time_series_new limit 1;
drop table public.submission_time_series_new;
select count(*) from submission_time_series;

--

CREATE TABLE public.submission_time_series (
	id varchar NOT NULL,
	observed_tstz timestamptz NOT NULL,
	ups int4 NULL,
	upvote_ratio numeric(3, 2) NULL,
	num_comments int4 NULL,
	CONSTRAINT submission_time_series_pkey PRIMARY KEY (id, observed_tstz)
);
CREATE INDEX "idx_observation_time_w/timezone" ON public.submission_time_series USING brin (observed_tstz);


-- public.submission_time_series foreign keys

ALTER TABLE public.submission_time_series ADD CONSTRAINT submission_time_series_id_fkey FOREIGN KEY (id) REFERENCES public.submission(id);