select count(*) from submission;

select count(*) from submission where title_vector is not null ;

drop index title_idx;
drop index title_idx;

-- Full-text search query
--explain analyse
select count(*)
from submission
where title @@ websearch_to_tsquery('ukrain');
--where title_vector @@ to_tsquery('ukraine | russia');

explain analyse
select title, similarity(title, 'ukr') as sml
	from submission
	order by sml desc, title;



--select title, word_similarity('ukr', title) as sml, created_utc 
select count(*)
	from submission
	where 'ukraine' <% title;
--	order by sml desc, created_utc desc;

	


-- Actual migration below
alter table submission 
	add column title_vector tsvector;
	
update submission 
set title_vector  = to_tsvector(title);

--create index title_idx
--	on submission
--	using GIN (title_vector);

create extension if not exists pg_trgm;
create index title_idx
	on submission
	using GIN (title gin_trgm_ops);