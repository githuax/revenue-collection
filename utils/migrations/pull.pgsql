declare
  _ts timestamptz;
  _payers jsonb;
  _invoices jsonb;
  _payments jsonb;
  _properties jsonb;
begin
  -- Convert timestamp from milliseconds to timestamptz
  _ts := to_timestamp(last_pulled_at / 1000);

  -- PAYERS
  select jsonb_build_object(
    'created', '[]'::jsonb,
    'updated', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'company_name', p.company_name,
          'tin', p.tin,
          'phone', p.phone,
          'email', p.email,
          'vendor', p.vendor,
          'property_owner', p.property_owner,
          'business_type', p.business_type,
          'last_payment_date', extract(epoch from p.last_payment_date) * 1000,
          'notes', p.notes,
          'created_by', p.created_by,
          'last_modified_by', p.last_modified_by,
          'created_datetime', extract(epoch from p.created_date_time) * 1000,
          'last_modified_date', extract(epoch from p.last_modified_date) * 1000
        )
      ) filter (
        where p.last_modified_date > _ts
      ),
      '[]'::jsonb
    ),
    'deleted', coalesce(
      jsonb_agg(to_jsonb(p.id)) filter (
        where p.deleted_at is not null and p.last_modified_date > _ts
      ),
      '[]'::jsonb
    )
  ) into _payers
  from payer p;

  -- INVOICES
  select jsonb_build_object(
    'created', '[]'::jsonb,
    'updated', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', i.id,
          'payer_id', i.payer,
          'created_by', i.created_by,
          'date', extract(epoch from i.date) * 1000,
          'amount_due', i.amount_due,
          'due_date', extract(epoch from i.due_date) * 1000,
          'notes', i.notes,
          'status', i.status,
          'ref_no', i.ref_no
        )
      ) filter (
        where i.last_modified_date > _ts
      ),
      '[]'::jsonb
    ),
    'deleted', coalesce(
      jsonb_agg(to_jsonb(i.id)) filter (
        where i.deleted_at is not null and i.last_modified_date > _ts
      ),
      '[]'::jsonb
    )
  ) into _invoices
  from invoice i;

  -- PAYMENTS
  select jsonb_build_object(
    'created', '[]'::jsonb,
    'updated', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', pm.id,
          'payer_id', pm.payer,
          'amount', pm.amount,
          'payment_type', pm.payment_type,
          'payment_method', pm.payment_method,
          'location', pm.location,
          'invoice', pm.invoice,
          'status', pm.status,
          'notes', pm.notes,
          'created_by', pm.created_by,
          'created_date', extract(epoch from pm.created_at) * 1000,
          'ref_no', pm.ref_no
        )
      ) filter (
        where pm.last_modified_date > _ts
      ),
      '[]'::jsonb
    ),
    'deleted', coalesce(
      jsonb_agg(to_jsonb(pm.id)) filter (
        where pm.deleted_at is not null and pm.last_modified_date > _ts
      ),
      '[]'::jsonb
    )
  ) into _payments
  from payment pm;

  -- PROPERTIES
  select jsonb_build_object(
    'created', '[]'::jsonb,
    'updated', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', pr.id,
          'owner_id', pr.owner,
          'property_ref_no', pr.property_ref_no,
          'address', pr.address,
          'geolocation', pr.geo_location,
          'assess_payment', pr.assess_payment,
          'payment_expiry_date', pr.payment_expiry_date,
          'type', pr.type,
          'notes', pr.notes,
          'images', pr.images
        )
      ) filter (
        where pr.last_modified_date > _ts
      ),
      '[]'::jsonb
    ),
    'deleted', coalesce(
      jsonb_agg(to_jsonb(pr.id)) filter (
        where pr.deleted_at is not null and pr.last_modified_date > _ts
      ),
      '[]'::jsonb
    )
  ) into _properties
  from property pr;

  -- Final JSON Response
  return jsonb_build_object(
    'changes', jsonb_build_object(
      'payers', _payers,
      'invoices', _invoices,
      'payments', _payments,
      'properties', _properties
    ),
    'timestamp', extract(epoch from now()) * 1000
  );
end;