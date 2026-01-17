ALTER TABLE symbols ADD COLUMN sortOrder INT NOT NULL DEFAULT 0;

UPDATE symbols s
JOIN (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY accountId ORDER BY createdAt, id) - 1 AS rn
  FROM symbols
) t ON s.id = t.id
SET s.sortOrder = t.rn;
