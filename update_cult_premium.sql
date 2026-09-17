-- Migration: Ensure all Cult & Solo Travelling Bags / Duffel Bags are marked as is_premium = true and categorized under duffle

UPDATE products
SET is_premium = true,
    sub_category = 'duffle',
    updated_at = NOW()
WHERE sku IN ('INV29561', 'INV29562', 'INV29563', 'INV30691', 'INV30692')
   OR LOWER(name) LIKE '%cult%'
   OR LOWER(name) LIKE '%solo 001 travelling bag%';
