declare
  payer jsonb;
begin
  -- Insert new payments
  for payer in select * from jsonb_array_elements(changes->'payers'->'created')
  loop
    insert into payer (
      id, first_name, last_name, company_name, tin,
      phone, email, vendor, property_owner, business_type,last_payment_date,notes,created_by,last_modified_by,created_date_time,last_modified_date
    )
    values (
      (payer->>'id')::uuid,
      (payer->>'first_name')::text,
      (payer->>'last_name')::text,
      (payer->>'company_name')::text,
      (payer->>'tin')::text,
      (payer->>'phone')::text,
      (payer->>'email')::text,
      (payer->>'vendor')::boolean,
      (payer->>'property_owner')::boolean,
      (payer->>'business_type'),
      to_timestamp(((payer->>'last_payment_date')::bigint) / 1000),
      (payer->>'notes')::text,
      (payer->>'created_by')::uuid,
      '72ae3628-93bb-486b-b656-4cd9baaa619d',
      to_timestamp(((payer->>'created_datetime')::bigint) / 1000),
      to_timestamp(((payer->>'last_modified_date')::bigint) / 1000)
    )
    on conflict (id) do nothing;
  end loop;
end;