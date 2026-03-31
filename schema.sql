CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Cleaning
    building_type TEXT,
    floors INTEGER,

    -- Mapping
    area_size TEXT,
    survey_purpose TEXT,

    -- Inspection
    inspection_building_type TEXT,
    inspection_type TEXT,

    -- 3D Modeling
    object_type TEXT,
    intended_use TEXT,

    -- Agriculture (Plant Health)
    crop_type TEXT,
    area_ha TEXT,

    -- Spraying
    spray_crop_type TEXT,
    spray_area_ha TEXT,
    season TEXT,

    -- Patrolling
    patrol_frequency TEXT,
    camera_type TEXT,

    -- Confined Space
    space_type TEXT,
    access_method TEXT,

    lang TEXT DEFAULT 'en',
    created_at TEXT DEFAULT (datetime('now'))
);
