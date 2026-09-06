UPDATE object_rooms
SET area = ROUND(area::numeric, 2),
    perimeter = ROUND(perimeter::numeric, 2),
    wall_area = ROUND(wall_area::numeric, 2),
    ceiling_height = ROUND(ceiling_height::numeric, 2);
