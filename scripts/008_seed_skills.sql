-- Seed initial skills data
insert into public.skills (name, category, description) values
  -- Design
  ('UI/UX Design', 'Design', 'User interface and user experience design'),
  ('Graphic Design', 'Design', 'Visual design for print and digital media'),
  ('Logo Design', 'Design', 'Brand identity and logo creation'),
  ('Web Design', 'Design', 'Website layout and visual design'),
  ('Illustration', 'Design', 'Digital and traditional illustration'),
  
  -- Development
  ('Frontend Development', 'Development', 'Client-side web development'),
  ('Backend Development', 'Development', 'Server-side development and APIs'),
  ('Full-Stack Development', 'Development', 'Complete web application development'),
  ('Mobile Development', 'Development', 'iOS and Android app development'),
  ('WordPress Development', 'Development', 'Custom WordPress themes and plugins'),
  
  -- Marketing
  ('SEO', 'Marketing', 'Search engine optimization'),
  ('Social Media Marketing', 'Marketing', 'Social media strategy and management'),
  ('Content Marketing', 'Marketing', 'Content strategy and creation'),
  ('Email Marketing', 'Marketing', 'Email campaigns and automation'),
  ('PPC Advertising', 'Marketing', 'Pay-per-click advertising campaigns'),
  
  -- Writing
  ('Copywriting', 'Writing', 'Marketing and sales copy'),
  ('Content Writing', 'Writing', 'Blog posts and articles'),
  ('Technical Writing', 'Writing', 'Documentation and technical content'),
  ('Translation', 'Writing', 'Language translation services'),
  
  -- Other
  ('Video Editing', 'Media', 'Video production and editing'),
  ('Photography', 'Media', 'Professional photography services'),
  ('Data Analysis', 'Analytics', 'Data processing and insights'),
  ('Consulting', 'Business', 'Business strategy and consulting')
on conflict (name) do nothing;
