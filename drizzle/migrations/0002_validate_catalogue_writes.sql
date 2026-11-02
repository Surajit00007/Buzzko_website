CREATE FUNCTION public.validate_product_data() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF jsonb_typeof(NEW.data) IS DISTINCT FROM 'object' OR NOT (NEW.data ?& ARRAY['id','name','category','material','price','shape','tone','accent','description','featured','featuredOrder']) THEN RAISE EXCEPTION 'Missing product fields'; END IF;
 IF jsonb_typeof(NEW.data->'name') <> 'string' OR length(trim(NEW.data->>'name')) NOT BETWEEN 1 AND 200 OR NEW.data->>'id' <> NEW.id THEN RAISE EXCEPTION 'Invalid product name or id'; END IF;
 IF jsonb_typeof(NEW.data->'price') <> 'number' OR (NEW.data->>'price')::numeric <= 0 OR NEW.data->>'category' NOT IN ('Keychains','Phone Charms','Frames') THEN RAISE EXCEPTION 'Invalid category or price'; END IF;
 IF NEW.data->>'shape' NOT IN ('heart','flower','star','smiley','letter','frame') OR NEW.data->>'tone' NOT IN ('pink','purple','lime','cyan','yellow','ink') OR NEW.data->>'accent' NOT IN ('pink','purple','lime','cyan','yellow','ink') THEN RAISE EXCEPTION 'Invalid charm appearance'; END IF;
 IF jsonb_typeof(NEW.data->'featured') <> 'boolean' OR jsonb_typeof(NEW.data->'featuredOrder') <> 'number' OR (NEW.data->>'featuredOrder')::numeric < 0 OR (NEW.data->>'featuredOrder')::numeric <> trunc((NEW.data->>'featuredOrder')::numeric) THEN RAISE EXCEPTION 'Invalid featured selection'; END IF;
 IF NEW.data ? 'salePrice' AND (jsonb_typeof(NEW.data->'salePrice') <> 'number' OR (NEW.data->>'salePrice')::numeric <= 0 OR (NEW.data->>'salePrice')::numeric >= (NEW.data->>'price')::numeric) THEN RAISE EXCEPTION 'Invalid sale price'; END IF;
 IF NEW.data ? 'image' AND (jsonb_typeof(NEW.data->'image') <> 'string' OR NEW.data->>'image' !~ '^photos/[a-zA-Z0-9_.-]+$') THEN RAISE EXCEPTION 'Invalid image path'; END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_product_data() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER validate_product_data BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.validate_product_data();