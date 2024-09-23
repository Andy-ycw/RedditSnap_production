drop index title_idx;

-- Full-text search query
select title, word_similarity('chiina', title) as sml
	from submission
	where 'ukr' <% title
	order by sml desc;


-- Migration commands
create extension if not exists pg_trgm;
create index title_idx
	on submission
	using gist(title gist_trgm_ops(siglen=256));
vacuum analyze submission;