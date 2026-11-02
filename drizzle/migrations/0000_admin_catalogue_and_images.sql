CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE TABLE public.products (id text PRIMARY KEY, data jsonb NOT NULL, sort_order integer NOT NULL DEFAULT 0, CONSTRAINT product_id_matches CHECK (data->>'id' = id), CONSTRAINT product_name_required CHECK (length(trim(data->>'name')) > 0), CONSTRAINT product_price_positive CHECK ((data->>'price')::numeric > 0), CONSTRAINT product_category_valid CHECK (data->>'category' IN ('Keychains','Phone Charms','Frames')), CONSTRAINT product_sale_valid CHECK (data->>'salePrice' IS NULL OR ((data->>'salePrice')::numeric > 0 AND (data->>'salePrice')::numeric < (data->>'price')::numeric)));
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public catalogue reads" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin inserts products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin updates products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin deletes products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.products (id, data, sort_order) VALUES
('bubble-heart','{"id":"bubble-heart","name":"Bubble Heart","category":"Keychains","material":"Glossy resin, gold-tone ring","price":349,"shape":"heart","tone":"pink","accent":"yellow","description":"A puffy domed heart cast in candy resin.","featured":true,"featuredOrder":1}',1),
('daisy-pop','{"id":"daisy-pop","name":"Daisy Pop","category":"Phone Charms","material":"Enamel on zinc alloy, lanyard strap","price":299,"shape":"flower","tone":"yellow","accent":"pink","description":"Five round petals around a sunny centre.","featured":true,"featuredOrder":2}',2),
('lucky-star','{"id":"lucky-star","name":"Lucky Star","category":"Keychains","material":"Acrylic, silver lobster clip","price":279,"shape":"star","tone":"lime","accent":"purple","description":"A soft-cornered star with a chunky outline.","featured":true,"featuredOrder":3}',3),
('smiley-club','{"id":"smiley-club","name":"Smiley Club","category":"Phone Charms","material":"Glossy resin, beaded strap","price":329,"shape":"smiley","tone":"cyan","accent":"ink","description":"A grinning disc for good-day energy.","featured":true,"featuredOrder":4}',4),
('initial-b','{"id":"initial-b","name":"Initial B","category":"Keychains","material":"Layered acrylic, split ring","price":249,"shape":"letter","tone":"purple","accent":"lime","description":"Your letter, extra chunky. Shown here as B.","featured":true,"featuredOrder":5}',5),
('mini-frame','{"id":"mini-frame","name":"Mini Frame","category":"Frames","material":"Enamel frame, clear acrylic window","price":449,"shape":"frame","tone":"pink","accent":"cyan","description":"A tiny wavy frame for your favourite photo.","featured":true,"featuredOrder":6}',6);
CREATE POLICY "Read product photos" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Admin uploads photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin removes photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));