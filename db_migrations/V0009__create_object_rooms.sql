CREATE TABLE object_rooms (
    id SERIAL PRIMARY KEY,
    object_id INTEGER NOT NULL REFERENCES objects(id),
    name VARCHAR(255) NOT NULL,
    room_type VARCHAR(100) NOT NULL DEFAULT '',
    area NUMERIC NOT NULL DEFAULT 0,
    perimeter NUMERIC NOT NULL DEFAULT 0,
    ceiling_height NUMERIC NOT NULL DEFAULT 0,
    wall_area NUMERIC NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_object_rooms_object_id ON object_rooms(object_id);
