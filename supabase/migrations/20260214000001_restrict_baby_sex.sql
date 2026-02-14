-- Standardize existing data and restrict baby sex to the WHO-supported values only.

do $$
begin
  update public.babies
    set sex = case
      when sex = 'female' then 'female'::text
      else 'male'::text
    end;

  alter table public.babies
    add constraint babies_sex_male_or_female
    check (sex in ('male', 'female'));

  alter table public.babies
    alter column sex set default 'male';
end $$;
