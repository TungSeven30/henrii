alter table public.babies
add column if not exists photo_url text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('baby-photos', 'baby-photos', true, 5242880)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

drop policy if exists "storage_baby_photos_select" on storage.objects;
create policy "storage_baby_photos_select"
on storage.objects
for select
using (bucket_id = 'baby-photos');

drop policy if exists "storage_baby_photos_insert_authorized" on storage.objects;
create policy "storage_baby_photos_insert_authorized"
on storage.objects
for insert
with check (
  bucket_id = 'baby-photos'
  and owner = auth.uid()
  and exists (
    select 1
    from public.babies b
    where b.id::text = split_part(name, '/', 1)
      and (
        b.owner_id = auth.uid()
        or exists (
          select 1
          from public.caregivers c
          where c.baby_id = b.id
            and c.user_id = auth.uid()
            and c.invite_status = 'accepted'
        )
      )
  )
);

drop policy if exists "storage_baby_photos_update_authorized" on storage.objects;
create policy "storage_baby_photos_update_authorized"
on storage.objects
for update
using (
  bucket_id = 'baby-photos'
  and (
    owner = auth.uid()
    or exists (
      select 1
      from public.babies b
      where b.id::text = split_part(name, '/', 1)
        and b.owner_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'baby-photos'
  and (
    owner = auth.uid()
    or exists (
      select 1
      from public.babies b
      where b.id::text = split_part(name, '/', 1)
        and b.owner_id = auth.uid()
    )
  )
);

drop policy if exists "storage_baby_photos_delete_authorized" on storage.objects;
create policy "storage_baby_photos_delete_authorized"
on storage.objects
for delete
using (
  bucket_id = 'baby-photos'
  and (
    owner = auth.uid()
    or exists (
      select 1
      from public.babies b
      where b.id::text = split_part(name, '/', 1)
        and b.owner_id = auth.uid()
    )
  )
);
