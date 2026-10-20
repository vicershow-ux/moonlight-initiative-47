INSERT INTO material_offers (company_id, material_id, shop_name, shop_address, shop_phone, shop_url, price)
SELECT m.company_id, m.id, m.shop_name, m.shop_address, m.shop_phone, m.shop_url, m.price
FROM materials m
WHERE NOT EXISTS (SELECT 1 FROM material_offers o WHERE o.material_id = m.id)
  AND (m.shop_name <> '' OR m.price > 0 OR m.shop_url <> '');