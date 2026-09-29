-- Khulna University's full discipline list — authoritative data supplied
-- directly (not derived from the mockup or invented). Must run before
-- seed_members.sql, which resolves members.discipline_id against this
-- table by code.

insert into disciplines (code, school, name, short_code, slug, website_path) values
  ('01', 'Science, Engineering & Technology School',   'Architecture',                              'ARCH', 'architecture',                          '/discipline/arch'),
  ('02', 'Science, Engineering & Technology School',   'Computer Science & Engineering',            'CSE',  'computer-science-engineering',         '/discipline/cse'),
  ('03', 'Management & Business Administration School','Business Administration',                   'BA',   'business-administration',              '/discipline/ba'),
  ('04', 'Science, Engineering & Technology School',   'Urban and Rural Planning',                  'URP',  'urban-rural-planning',                 '/discipline/urp'),
  ('05', 'Life Science School',                        'Forestry & Wood Technology',                'FWT',  'forestry-wood-technology',             '/discipline/fwt'),
  ('06', 'Life Science School',                        'Fisheries & Marine Resource Technology',    'FMRT', 'fisheries-marine-resource-technology', '/discipline/fmrt'),
  ('07', 'Life Science School',                        'Biotechnology & Genetic Engineering',       'BGE',  'biotechnology-genetic-engineering',    '/discipline/bge'),
  ('08', 'Life Science School',                        'Agrotechnology',                            'AT',   'agrotechnology',                       '/discipline/at'),
  ('09', 'Science, Engineering & Technology School',   'Electronics and Communication Engineering', 'ECE',  'electronics-communication-engineering','/discipline/ece'),
  ('10', 'Life Science School',                        'Environmental Science',                     'ES',   'environmental-science',                '/discipline/es'),
  ('11', 'Life Science School',                        'Pharmacy',                                  'PHARM','pharmacy',                             '/discipline/pharm'),
  ('12', 'Science, Engineering & Technology School',   'Mathematics',                                'MATH', 'mathematics',                          '/discipline/math'),
  ('13', 'Life Science School',                        'Soil, Water and Environment',               'SWE',  'soil-water-environment',               '/discipline/swe'),
  ('14', 'Arts & Humanities School',                   'English',                                   'ENG',  'english',                              '/discipline/eng'),
  ('15', 'Social Science School',                      'Economics',                                 'ECON', 'economics',                            '/discipline/econ'),
  ('16', 'Social Science School',                      'Sociology',                                 'SOC',  'sociology',                            '/discipline/soc'),
  ('17', 'Science, Engineering & Technology School',   'Physics',                                   'PHY',  'physics',                              '/discipline/phy'),
  ('18', 'Science, Engineering & Technology School',   'Chemistry',                                 'CHEM', 'chemistry',                            '/discipline/chem'),
  ('19', 'Arts & Humanities School',                   'Bangla',                                    'BAN',  'bangla',                               '/discipline/ban'),
  ('20', 'Science, Engineering & Technology School',   'Statistics',                                'STAT', 'statistics',                           '/discipline/stat'),
  ('21', 'Social Science School',                      'Development Studies',                       'DS',   'development-studies',                  '/discipline/ds'),
  ('22', 'Fine Arts School',                           'Drawing and Painting',                      'DP',   'drawing-painting',                     '/discipline/dp'),
  ('23', 'Fine Arts School',                           'Printmaking',                                'PM',   'printmaking',                          '/discipline/pm'),
  ('24', 'Fine Arts School',                           'Sculpture',                                  'SC',   'sculpture',                            '/discipline/sc');
