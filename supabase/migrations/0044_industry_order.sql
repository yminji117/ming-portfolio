-- 어드민에서 업종(카테고리) 노출 순서를 바꿀 수 있도록 site_settings에 순서 저장
alter table site_settings
  add column industry_order jsonb not null default
    '{"professional":["Education","OTT","Commerce","Brand"],"side":["Community","Popup","Online","Offline"]}'::jsonb;
