-- Seed songs import
-- Replace the placeholders before running:
--   YOUR_USER_ID  → uuid of the target user (from auth.users / profiles)
--   YOUR_TEAM_ID  → uuid of the target team, or set both team_id columns to NULL for personal songs
--
-- Personal songs (no team):
--   user_id   = 'YOUR_USER_ID'
--   team_id   = NULL
--   created_by = 'YOUR_USER_ID'
--
-- Team songs:
--   user_id   = NULL
--   team_id   = 'YOUR_TEAM_ID'
--   created_by = 'YOUR_USER_ID'

INSERT INTO public.songs (user_id, team_id, title, artist, key, bpm, lyrics, notes, status, created_by, transpose, capo) VALUES
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'De Gloria En Gloria', 'Marco Barrientos', 'Bb', 128, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Él Es El Rey', 'Danilo Montero', 'G', 134, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Al Que Está Sentado en el Trono', 'Marcos Brunet', 'A', 141, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Es navidad', 'Rojo', 'A', 120, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Al Que Es Digno', 'Marcos Witt', 'D', 110, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Digno', 'Marcos Brunet', 'A', 130, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Con humildad', 'Coalo Zamorano', 'E', 117, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Cuan Grande Es Dios', 'En Espiritu Y En Verdad', 'C', 144, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Somos el Pueblo de Dios', 'Marcos Witt', 'G', 95, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Espíritu y verdad', 'Marcos Barrientos', 'A', 120, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Santo por siempre', 'La IBI', 'G', 140, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Mi esperanza esta en Jesus', 'Bethel Music', 'A', 144, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Ven ante su trono', 'Elevation worship', 'D#', 120, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Revelación', 'Danilo Montero', 'A', 136, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Por Siempre', 'En espíritu y en verdad', 'G#', 143, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'El Señor Es Mi Pastor', 'Danilo Montero', 'C', 63, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Serviremos al señor', 'Para su gloria', 'D', 96, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Un Siervo Para Tu Gloria', 'Sovereign Grace Music', 'B', 130, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Lo Harás Otra Vez', 'Elevation Worship', 'A#', 86, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Al mundo paz', 'Lakewood', 'D', 120, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'No Hay Lugar Más Alto', 'Miel San Marcos', 'A', 136, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Grande y Fuerte', 'Miel San Marcos', 'Am', 150, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Te Doy Gloria', 'Marco Barrientos', 'C', 136, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Tu Nombre, Oh Dios', 'Marcos Witt', 'A', 127, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Somos Iglesia', 'Un Corazón', 'D#', 75, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Gracia Sublime Es', 'En Espiritu Y En Verdad', 'Bb', 100, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Gracia Sin Fin', 'Alexander González', 'A#', 130, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Rey de reyes', 'Marco Barrientos', 'D', 147, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Amor Sin Condición', 'Twice Musica Cristiana', 'D#m', 166, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Hay Libertad', 'La Ibi', 'D', 148, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Tu Mirada', 'Marcos Witt', 'G', 96, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Eres Todo Poderoso', 'Danilo Montero', 'Bm', 125, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'El Dios Que Adoramos', 'Sovereign Grace Music', 'F#', 110, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Con Mis Manos Levantadas', 'Danilo Montero', 'A', 128, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'A Ti Me Rindo', 'Hillsong en Español', 'F', 154, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Bueno Es Alabar', 'Danilo Montero', 'G', 119, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Glorioso Día', 'Passion', 'D', 110, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Creo En Ti', 'Julio Melgar', 'D', 140, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Tu Fidelidad', 'Marcos Witt', 'G', 106, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Derramo El Perfume', 'Montesanto', 'Bb', 130, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Dios Poderoso', 'La Ibi', 'A#', 116, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'Abre Mis Ojos', 'Danilo Montero', 'E', 128, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0),
  (NULL, '7c9be66a-9bb3-4ce1-a572-a48e3f15d930'::uuid, 'La Casa de Dios', 'Danilo Montero', 'D', 143, NULL, NULL, 'published', '2d492fb4-6935-4832-9a19-ec4d7f3d4ab7'::uuid, 0, 0)
ON CONFLICT DO NOTHING;
