BEGIN;

INSERT INTO users (username, email, phone, password, role, status, created_at) VALUES
('jeremyrogers', 'charlesschmidt@example.com', '7873325553', '#ZF90zPaE3$E', 'owner', 'inactive', '2026-02-28 20:15:05'),
('ashleysmith', 'karen15@example.net', '3294663208', '5wdY7yE&(z4D', 'technician', 'inactive', '2026-01-14 10:00:01'),
('mariohall', 'paulreed@example.com', '(371)394-7983x1', 'p4BQsxjv#W2X', 'customer', 'active', '2026-02-04 06:35:58'),
('hansonmichelle', 'eduncan@example.net', '669-982-3993x27', '9PGzDl!P)W9B', 'customer', 'active', '2026-03-21 20:52:15'),
('curtisdavis', 'jameslewis@example.com', '+1-626-560-4602', '!(90ucXut3*E', 'owner', 'inactive', '2026-02-17 11:08:57'),
('welchrandy', 'heather96@example.com', '596.461.7149', 'W9jN4chcc^9r', 'customer', 'active', '2026-02-13 20:19:28'),
('candacesmith', 'pkelly@example.net', '582.989.8571x17', '69!Dnpdz%82c', 'customer', 'active', '2026-01-14 06:09:21'),
('bgeorge', 'spencerramirez@example.com', '7462453377', 'S$1)7AX#5eBF', 'technician', 'inactive', '2026-03-02 06:55:43'),
('lisajohnson', 'mcconnellderek@example.com', '334-261-5309x65', '7)!a_@1gPg3P', 'customer', 'active', '2026-03-08 12:43:28'),
('richardhughes', 'farmerchristopher@example.org', '(897)325-3747x9', '@HBo_HIi%7t9', 'owner', 'active', '2026-01-28 04:18:22'),
('isaac24', 'smithjohn@example.com', '806-732-0660x13', '(raIz!t4t18_', 'owner', 'active', '2026-02-02 19:48:06'),
('glennbryan', 'zgray@example.net', '(932)595-9135x0', '5)!h+G^a&K#L', 'owner', 'inactive', '2026-01-30 02:36:41'),
('powerspatrick', 'fieldssamantha@example.com', '4037670660', 'W0ISw+4D^9!x', 'owner', 'active', '2026-02-25 20:24:36'),
('davidmann', 'dixonwesley@example.com', '+1-673-781-9861', '!G63Rb88L&0O', 'owner', 'inactive', '2026-02-20 01:41:11'),
('qtorres', 'maryhayes@example.com', '001-716-489-794', 'myQ7&zwBD*7u', 'customer', 'inactive', '2026-02-08 16:14:31'),
('brewerdenise', 'johnhudson@example.com', '001-979-863-304', '!0v6Sw9wlaf#', 'customer', 'active', '2026-01-27 22:10:45'),
('efrost', 'sarah86@example.com', '8992729051', '(8iuY%kafh3n', 'owner', 'active', '2026-01-05 05:13:32'),
('ujones', 'charles63@example.org', '483-399-7566x47', '$l_7RhFsAU_k', 'owner', 'active', '2026-02-08 17:26:56'),
('lambertlori', 'samantha40@example.net', '452.441.0067x32', '2OWiSw2i+5G%', 'owner', 'active', '2026-03-15 13:49:33'),
('oliviamassey', 'goodmanalec@example.com', '415.605.1638x78', '8aZ*1@gD*nMA', 'technician', 'inactive', '2026-01-23 03:24:14'),
('xjordan', 'robinroberson@example.com', '697.644.3650', 'E4Q9Faoa^I(Z', 'customer', 'inactive', '2026-03-08 14:34:14'),
('hineschristopher', 'garnerjoseph@example.net', '001-992-712-717', '8!75ERPyCRy#', 'owner', 'active', '2026-02-08 16:58:34'),
('cruzmichael', 'karenthompson@example.net', '(432)360-8940x4', 'C1q@penRMntD', 'owner', 'inactive', '2026-01-03 11:05:57'),
('parkersheri', 'sparkssusan@example.net', '+1-320-378-9395', '^LMqHymjj9NR', 'technician', 'inactive', '2026-03-18 00:47:58'),
('xlee', 'mlucas@example.net', '+1-900-293-8140', '+UY+ztRez1Ug', 'owner', 'inactive', '2026-03-05 20:58:05'),
('anthony37', 'dterrell@example.net', '001-994-799-329', '$3*mFb3!QpD2', 'customer', 'active', '2026-02-05 19:45:29'),
('reynoldsashley', 'smithjonathan@example.org', '+1-228-885-2020', 'U5HNaEV@%1c^', 'owner', 'active', '2026-02-22 00:33:44'),
('owells', 'lisa61@example.com', '+1-935-941-8795', '!56Xj4Ww#O*s', 'technician', 'active', '2026-01-25 03:04:07'),
('cynthia79', 'aray@example.org', '2354833031', 'BXUqA7NsC)^0', 'technician', 'inactive', '2026-02-25 16:16:31'),
('taylorthomas', 'jason12@example.net', '+1-485-379-9988', '3$bIYTwoUQ23', 'technician', 'active', '2026-02-12 12:14:32'),
('randallbutler', 'anthony85@example.org', '920.886.8150', '4$vK!2axe*7$', 'customer', 'active', '2026-01-19 04:14:23'),
('kimberly80', 'oguzman@example.com', '411-439-2076x55', '5eBNc^Bn_Z6I', 'technician', 'inactive', '2026-01-24 22:18:16'),
('ccarter', 'williamssandra@example.net', '+1-747-651-1944', '_f)NKxhpX6e$', 'technician', 'active', '2026-01-25 15:23:10'),
('scott08', 'helen94@example.com', '+1-598-417-3366', '_9Pi@LDL%i9N', 'customer', 'inactive', '2026-03-10 13:51:00'),
('brittanyharrison', 'xhahn@example.com', '(804)295-6749x2', '_pmPDvn8b5km', 'owner', 'inactive', '2026-02-01 22:31:11'),
('elizabethleblanc', 'bmccann@example.net', '001-739-631-695', '2)Z3O4Mn*5yo', 'technician', 'active', '2026-03-20 00:41:32'),
('lesuzanne', 'houstonmarissa@example.org', '564.811.4984x70', 'LuX9xRxpOr%Z', 'owner', 'inactive', '2026-01-26 17:19:08'),
('gkramer', 'sloanfrederick@example.net', '+1-248-933-2414', 'K(eHW*oxJG5+', 'owner', 'inactive', '2026-01-19 07:27:36'),
('zporter', 'award@example.com', '+1-616-304-0717', 'ytRx5pJp+oF&', 'customer', 'inactive', '2026-02-15 09:24:26'),
('moorebenjamin', 'cody55@example.com', '2507106314', 'J+#nWl69*5zn', 'technician', 'active', '2026-02-11 22:12:06'),
('sethhernandez', 'christinasantiago@example.net', '+1-730-355-3498', '*V5H&oIk%O73', 'technician', 'inactive', '2026-02-14 16:01:16'),
('egibson', 'jade01@example.com', '(534)226-4981x8', '9#_7U*+QkcD@', 'customer', 'inactive', '2026-03-05 02:23:19'),
('jordanrichard', 'thomasgerald@example.net', '845.562.7669x53', '&@1^kJdQjyPl', 'technician', 'inactive', '2026-02-19 16:40:19'),
('seanlucas', 'alejandrofrancis@example.org', '(940)943-7465', 'FxVi3pVF_2sU', 'technician', 'active', '2026-03-05 08:47:45'),
('tylersutton', 'steinevan@example.org', '4683807950', '*#CW7ZFwuB39', 'customer', 'inactive', '2026-02-19 09:35:54'),
('jenniferleach', 'veronica67@example.org', '4969958828', ')9W$NayutBjt', 'customer', 'active', '2026-01-26 18:58:29'),
('shawngood', 'trichardson@example.com', '001-713-800-741', '^**t_Tk1yd1@', 'customer', 'active', '2026-01-03 22:25:16'),
('ljones', 'jeffreygarcia@example.org', '(700)708-3222', 'GliRx7F0&_D0', 'customer', 'active', '2026-01-16 14:13:50'),
('josephroberto', 'buchanankenneth@example.org', '444.922.4698x77', 'e0Ezg+Zk_#0_', 'technician', 'inactive', '2026-01-21 17:11:53'),
('eric43', 'floydshelley@example.org', '(351)876-8901', 'd8Z&3vkVrn3l', 'technician', 'active', '2026-03-13 02:12:33');

INSERT INTO shops (shop_name, address, contact_number, owner_id, created_at) VALUES
('Barton-Allen', '859 Barnes Drive
Smithborough, NV 57908', '001-881-242-9614x981', 37, '2026-03-07 06:12:05'),
('Brewer, Roberts and Davis', 'PSC 4680, Box 7484
APO AP 32664', '8453486718', 13, '2026-01-25 13:04:32'),
('Gonzalez, Ortiz and Thompson', '02273 Bender Fork
Lake Mitchell, SD 79850', '650-549-1296', 14, '2026-02-02 12:11:56'),
('Bush PLC', '2449 Martinez Island
East Paulmouth, WI 83499', '959-436-8628x090', 37, '2026-03-03 15:36:56'),
('Johnson, Castro and Wilkins', '364 Robert Radial Apt. 928
Nancymouth, VI 16147', '001-340-441-2658x791', 11, '2026-03-06 16:35:23'),
('Rogers, Norman and Carlson', '858 Johnson Groves Apt. 544
South Maureentown, TX 74600', '+1-661-232-1782', 10, '2026-01-17 16:02:58'),
('Jacobs-Stevens', '0121 Contreras Street Apt. 489
Port Tracytown, OR 66577', '001-787-384-9329', 19, '2026-01-06 14:01:48'),
('Mendoza Inc', '9155 Hooper Mountain Apt. 401
Port Gregoryhaven, TN 07874', '415-606-3187', 27, '2026-02-18 13:29:51'),
('Lopez-Singleton', '506 Kimberly Forge
East Josephbury, MT 21439', '(949)931-6816', 18, '2026-03-20 10:05:29'),
('Welch, Green and Reynolds', '341 Mary Lodge
North Steven, AR 96236', '(559)904-4960x01161', 38, '2026-02-08 09:52:12'),
('Ballard, Galvan and Johnson', '2103 Bruce Walk
South Jeanetteville, SD 88330', '5183133468', 10, '2026-03-19 12:43:14'),
('Alvarado-Banks', '611 Lindsey Loop Suite 532
Lake Kimberly, VI 96027', '(230)926-0116x5114', 1, '2026-03-23 03:06:25'),
('Dean-Compton', '1457 Amber Terrace Suite 573
North Robert, NY 27454', '001-791-482-2945x392', 11, '2026-02-04 08:29:10'),
('Jacobs-Martin', '1068 Thomas Roads
Smithbury, NC 70590', '2175451603', 5, '2026-01-13 23:54:21'),
('Simmons-Riddle', '8205 Aaron Path Apt. 348
Paulshire, NV 45476', '5709964598', 17, '2026-03-14 07:31:38'),
('Snyder and Sons', '09738 Jennifer Springs Apt. 475
Hayeshaven, PW 51969', '991-634-6122x244', 18, '2026-03-23 11:44:32'),
('Hopkins and Sons', '1556 William Loaf Apt. 030
Hodgestown, UT 41376', '(968)754-9614', 35, '2026-01-28 20:13:08'),
('Brooks and Sons', '545 Bruce View Apt. 636
Josephborough, VI 67575', '(915)659-5813', 23, '2026-02-14 19:37:00'),
('Solomon, Avila and Collier', '07029 Zachary Centers Apt. 764
Williamsmouth, ME 16763', '215.373.1251x563', 12, '2026-01-16 22:46:04'),
('Rivers, Gilbert and Smith', '644 Wallace Bridge Apt. 336
Autumntown, ND 54007', '747-899-6373', 22, '2026-01-05 04:46:32');

INSERT INTO inventory_items (shop_id, item_name, category, quantity, price) VALUES
(12, 'Allow', 'Parts', 10, 197.33),
(13, 'Left', 'Tools', 32, 285.49),
(4, 'Prepare', 'Parts', 39, 361.83),
(11, 'Pretty', 'Accessories', 19, 248.09),
(7, 'Stand', 'Parts', 22, 162.48),
(8, 'Ground', 'Parts', 16, 341.65),
(6, 'Large', 'Tools', 29, 187.34),
(19, 'State', 'Parts', 22, 496.66),
(8, 'News', 'Parts', 37, 187.35),
(10, 'Share', 'Electronics', 29, 449.94),
(5, 'Toward', 'Accessories', 16, 366.32),
(1, 'Involve', 'Electronics', 20, 285.82),
(9, 'Rock', 'Parts', 13, 424.02),
(1, 'Answer', 'Tools', 18, 198.56),
(4, 'Ability', 'Electronics', 26, 223.09),
(18, 'Born', 'Parts', 21, 40.3),
(7, 'Sea', 'Parts', 25, 195.16),
(5, 'She', 'Tools', 43, 26.3),
(11, 'Moment', 'Accessories', 7, 386.6),
(2, 'They', 'Electronics', 10, 384.74),
(20, 'Environment', 'Accessories', 10, 152.93),
(3, 'Marriage', 'Accessories', 12, 237.82),
(7, 'Itself', 'Tools', 47, 356.08),
(7, 'Husband', 'Electronics', 10, 303.72),
(5, 'Relate', 'Accessories', 25, 13.48),
(12, 'Option', 'Electronics', 42, 410.93),
(8, 'While', 'Tools', 45, 313.2),
(4, 'Job', 'Accessories', 32, 382.81),
(6, 'Hotel', 'Tools', 43, 498.35),
(7, 'Tv', 'Electronics', 28, 214.9),
(17, 'Surface', 'Accessories', 18, 70.06),
(17, 'There', 'Tools', 8, 329.59),
(12, 'Listen', 'Tools', 33, 278.04),
(9, 'Station', 'Parts', 45, 397.11),
(13, 'Fish', 'Electronics', 47, 50.38),
(8, 'Police', 'Accessories', 32, 298.58),
(4, 'Still', 'Accessories', 36, 276.99),
(18, 'Recently', 'Parts', 33, 149.66),
(20, 'Kind', 'Accessories', 12, 498.48),
(3, 'Produce', 'Tools', 18, 476.41),
(5, 'Truth', 'Parts', 46, 294.93),
(14, 'Company', 'Accessories', 8, 270.31),
(12, 'Style', 'Accessories', 29, 142.04),
(13, 'Pull', 'Parts', 9, 197.13),
(8, 'Campaign', 'Accessories', 5, 147.59),
(6, 'None', 'Electronics', 42, 309.93),
(16, 'Within', 'Tools', 24, 22.78),
(18, 'Some', 'Electronics', 46, 29.71),
(14, 'Assume', 'Parts', 45, 250.53),
(8, 'Guess', 'Parts', 12, 113.84),
(15, 'Either', 'Electronics', 18, 59.18);

INSERT INTO repair_requests (shop_id, customer_id, technician_id, device_type, issue_description, media_file, status, technician_notes, created_at) VALUES
(6, 3, 49, 'Desktop', 'Shoulder miss music figure tell serious. Form sense school question blood rather notice.', 'respond.jpg', 'Pending', 'Glass expect order different.
Side detail I single pattern education. Hospital without happy. Wrong law perform protect against important must.', '2026-02-28 14:18:18'),
(11, 42, 24, 'Desktop', 'Attack reality past PM kind month. Unit do operation control than ready test member. Care indicate economic.', 'production.jpg', 'Pending', 'Something main mean ask rule. Analysis indeed performance standard wonder she fill. Fast mouth challenge name condition democratic public.', '2026-01-22 20:10:38'),
(8, 31, 20, 'Laptop', 'Crime seat national. Positive successful couple support. Red interesting add type another. Main available phone any participant election reach.', 'hope.jpg', 'Pending', 'Public leave model. Hotel red miss whatever.
Rock still total leader probably such. Whole idea training shoulder lead anyone.', '2026-01-15 08:26:36'),
(7, 6, 24, 'Phone', 'Use federal responsibility. Step summer bank name good me professional.
State wrong cut economy item. Lay see seek film.', 'score.jpg', 'Completed', 'Officer campaign performance value somebody total reduce mind. Investment human determine late bank. Free guess why nature candidate course.', '2026-01-10 22:45:55'),
(5, 46, 8, 'Laptop', 'Kind staff attack piece focus suddenly affect. Conference position child yet fly who cell. Instead kid hair among increase I. Myself military system attention long hundred.', 'maintain.jpg', 'Completed', 'Light ago identify less authority grow. Race social raise even story civil about.
Majority parent practice name him. Goal less participant pattern.', '2026-02-04 12:58:10'),
(11, 26, 28, 'Laptop', 'Risk usually about agent. Never wish scene without sign mouth.
Apply bank southern fly. Number early bank direction collection view. Step from difficult music sure surface.', 'voice.jpg', 'Completed', 'Factor experience eight lawyer rock trip. Not democratic sister central. Trial plan southern tonight.', '2026-01-30 02:10:12'),
(3, 16, 49, 'Laptop', 'For attention ten institution. Significant college time able six poor. Authority unit culture.
Theory mention message business force good field. Professional home responsibility place good.', 'any.jpg', 'Pending', 'Land church son smile pattern. Accept capital view scene.', '2026-03-01 07:09:39'),
(2, 48, 50, 'Desktop', 'Magazine share inside one tough college air. Experience figure too same. Assume part head reason.', 'do.jpg', 'In Progress', 'Wide reason prove raise lot. Doctor argue traditional beautiful. Week development five enough tough.', '2026-02-27 08:29:58'),
(2, 47, 8, 'Tablet', 'Call usually focus reach room woman. Manager type economy else our agree. Customer brother its.
Expect movement will manage dinner listen. Responsibility week everybody large above crime.', 'foreign.jpg', 'In Progress', 'Particular try something structure compare board. Go common their environmental street as well example. Size right unit own any away really bring.', '2026-03-23 02:48:33'),
(1, 46, 50, 'Desktop', 'Both group wife beat company. Popular him people street.
Reduce part country my. Occur will inside agree administration.
Whose mention they street policy. Green remain century green song ten.', 'season.jpg', 'Pending', 'Adult military meet how culture six. War speech always while probably. May account seven these its student specific.', '2026-01-24 00:53:48'),
(16, 26, 8, 'Printer', 'Since choice local. Especially tax although. Attention term view charge.
Risk none a. Ok agree sense shoulder.
Evidence ask drug. Detail police voice about clearly.', 'college.jpg', 'In Progress', 'Center way near. Western hope conference.', '2026-03-15 09:00:27'),
(15, 31, 29, 'Printer', 'Tax whatever level quickly. Machine form word brother style yourself.', 'phone.jpg', 'In Progress', 'Sometimes ask result evening. Believe wind item something property report per news.', '2026-01-05 15:42:50'),
(16, 26, 29, 'Printer', 'Market production suddenly order admit response. Understand reality firm power.
Degree chair business sound now record modern.', 'growth.jpg', 'Pending', 'Economic voice beautiful treatment from quite game should. Relate sea support indeed. Store on wind officer deep.', '2026-03-03 08:26:00'),
(7, 31, 8, 'Laptop', 'Bank specific arrive event second point want teach. Interesting society member large right mouth.
Rule others shoulder. Water life gun loss.', 'hear.jpg', 'In Progress', 'Collection western family give bill. Per enough woman spring for rather. Can them floor.', '2026-01-11 00:47:21'),
(16, 31, 32, 'Desktop', 'Away conference it job wish capital. Style plan stay one pass time organization.
Board suffer state. Near mention skin world remember party.', 'former.jpg', 'Completed', 'Occur bag now send school. Student discover course language develop dream. Money scientist history back compare tree image water. Someone I wrong.', '2026-02-09 11:07:52'),
(2, 9, 8, 'Phone', 'Enjoy statement would building attack.
Vote kitchen three matter box. Season house process any style feeling. White close which far say.', 'energy.jpg', 'Completed', 'List significant cover head it scientist half. According election above fast if near.', '2026-03-20 00:44:44'),
(19, 34, 40, 'Desktop', 'Stuff nice control traditional southern. New dream sure spring various.
Assume arm increase guess color inside quality.', 'into.jpg', 'Pending', 'Than staff board understand nearly team. What during company nor.
Foot animal perform save all. Could least guy yourself.', '2026-02-26 07:09:29'),
(6, 48, 8, 'Phone', 'Green true space. Not science newspaper our whose school factor. Ground one performance rest size although. Available return western their establish will owner.', 'religious.jpg', 'Completed', 'Rock night no week approach. Hear participant serious.
Lay hospital bring year day notice. Me important effort author.', '2026-01-29 01:36:36'),
(15, 21, 32, 'Phone', 'Bed within do case. Audience American build food local card.
Whose reason instead individual piece cultural. Assume their top culture glass during do.', 'authority.jpg', 'In Progress', 'Stop plant cultural act.
Ago reason top ability customer. System fill black dream language bar peace. Republican dog he various.', '2026-03-17 05:13:06'),
(8, 46, 49, 'Laptop', 'Somebody before discover clearly partner. Act finally majority player bed. Eight anything expect cover authority.', 'guess.jpg', 'In Progress', 'Meeting same follow particularly. List citizen throughout site.
Look free top move do big. Once eye quality.', '2026-03-15 05:59:05'),
(4, 21, 8, 'Tablet', 'Life movie number suddenly century. Mouth vote against set camera.
Trip right no report speak. Oil visit prove force end late item point. Change environmental lawyer study wish.', 'recently.jpg', 'Completed', 'On speech many town. Stock how ago center himself or. Build heavy free maintain.', '2026-03-02 06:53:07'),
(5, 7, 30, 'Phone', 'Pull page yet vote. Democratic heart attack deep sure play.
Clear away network current city within western. For lot study car himself thought dinner by. Enjoy light model nice.', 'early.jpg', 'Completed', 'Relationship trouble that.
Stage candidate create before. Social same civil others place choice. Evidence whole crime mention.', '2026-02-02 19:33:12'),
(4, 31, 36, 'Laptop', 'Project house move break away boy sign involve.
Yourself reach and culture.
Across democratic go memory. Make vote world arrive. This way company drug.', 'stay.jpg', 'In Progress', 'Because line exactly environmental actually one.
He former pass end. Section media if until tonight produce happy. Machine white my theory.', '2026-02-03 20:48:53'),
(15, 34, 30, 'Desktop', 'Road here play several street team. Break card coach reveal thank walk. Put fast mother discussion yes.
Apply job control happy participant onto line. Clearly determine start eight guess result.', 'cup.jpg', 'Completed', 'Put trial democratic personal. Respond brother ten theory security.
Significant prepare lot street. National drive right across community record sea.', '2026-03-19 14:28:54'),
(7, 16, 44, 'Tablet', 'Bring sometimes few tend design organization water. Politics result say study personal one show. Prevent style suggest responsibility piece sell.', 'game.jpg', 'Pending', 'Avoid religious item everyone enough condition method. Traditional between when worker perform. Food yes different necessary culture.', '2026-02-05 17:17:55'),
(15, 39, 29, 'Printer', 'Send effect reflect yard effect. Body bed about act. Only feeling ever city follow management time. Black model perform education expert.', 'foreign.jpg', 'In Progress', 'Unit current born push. Million exist contain. Place science around strategy leg outside hope.', '2026-01-28 02:52:10'),
(20, 46, 50, 'Laptop', 'Catch enjoy area meeting. Able soldier word.
Development wish impact itself trade message. Book once four present center. Arrive memory field blue compare plant.', 'collection.jpg', 'Pending', 'Dream front but data task attention. Start allow what particular available reveal.', '2026-01-03 15:11:45'),
(13, 46, 32, 'Desktop', 'Set able ground us bag share. Radio friend source change down over.
View use ahead every. Push provide wait rule such. Gas fast make capital player skill own safe.', 'sort.jpg', 'In Progress', 'Process daughter note nature here finally maybe. Prepare ok professor another office present.', '2026-02-12 03:16:48'),
(4, 48, 44, 'Printer', 'Among its detail now high small. None report necessary decision price.
Whole specific how maybe quite position third. Sell sing season inside. Raise laugh technology win including design.', 'glass.jpg', 'Pending', 'Help decide over. Nation place factor old section. Home pretty either significant.', '2026-02-16 20:50:01'),
(1, 7, 40, 'Tablet', 'Identify security them bit. Figure now oil. Drug west speech organization performance.
Foreign little maintain. During toward enter ball away hard success piece. Individual wish large forget huge.', 'attorney.jpg', 'Completed', 'Debate person mention authority foot prove.
Low quality me. You including visit simply rest.', '2026-01-11 12:25:11');

INSERT INTO sales_transactions (shop_id, customer_id, staff_id, total_amount, payment_method, transaction_date) VALUES
(12, 16, 28, 1112.16, 'Gcash', '2026-01-14 07:47:19'),
(20, 3, 44, 917.58, 'PayPal', '2026-02-24 21:21:25'),
(2, 31, 2, 5001.62, 'PayPal', '2026-02-18 06:35:37'),
(12, 31, 17, 6453.61, 'Credit Card', '2026-02-19 22:12:37'),
(2, 7, 37, 3462.66, 'Credit Card', '2026-03-14 18:06:44'),
(5, 21, 13, 1517.88, 'Credit Card', '2026-03-18 13:41:13'),
(7, 48, 23, 3070.82, 'PayPal', '2026-02-04 23:54:42'),
(6, 4, 19, 3795.14, 'Gcash', '2026-01-21 21:13:26'),
(8, 48, 5, 5030.15, 'Gcash', '2026-01-04 07:17:07'),
(17, 31, 14, 539.77, 'Gcash', '2026-03-12 21:29:07'),
(19, 48, 13, 6456.58, 'Cash', '2026-03-04 17:17:58'),
(12, 7, 8, 1578.64, 'PayPal', '2026-03-14 21:27:56'),
(11, 7, 50, 3340.89, 'Gcash', '2026-03-14 00:04:14'),
(14, 42, 35, 1002.12, 'Gcash', '2026-02-08 16:38:04'),
(2, 4, 44, 5386.36, 'Gcash', '2026-02-02 03:58:10'),
(17, 31, 14, 399.65, 'Gcash', '2026-01-26 09:51:34'),
(1, 15, 12, 3700.52, 'Cash', '2026-02-10 00:42:28'),
(16, 45, 35, 318.92, 'Gcash', '2026-02-11 23:17:28'),
(10, 42, 29, 6749.1, 'PayPal', '2026-01-08 18:38:43'),
(17, 21, 19, 2727.49, 'Gcash', '2026-01-03 22:58:46'),
(20, 7, 37, 7477.2, 'Gcash', '2026-03-23 20:17:38'),
(14, 6, 20, 0, 'PayPal', '2026-01-24 11:03:39'),
(5, 15, 11, 2030.5, 'Cash', '2026-02-08 01:07:33'),
(15, 45, 2, 1361.14, 'PayPal', '2026-02-21 02:00:59'),
(7, 4, 29, 1398.6, 'Gcash', '2026-02-10 01:15:20'),
(17, 34, 1, 659.18, 'PayPal', '2026-03-06 04:24:45'),
(15, 15, 41, 828.52, 'Gcash', '2026-01-24 23:02:55'),
(20, 3, 36, 1608.68, 'Cash', '2026-03-18 20:50:27'),
(8, 42, 41, 626.4, 'Cash', '2026-01-13 06:13:57'),
(12, 42, 22, 1846.19, 'Gcash', '2026-03-13 14:59:08');

INSERT INTO sales_items (transaction_id, item_id, quantity, price) VALUES
(28, 21, 4, 611.72),
(15, 20, 3, 1154.22),
(18, 47, 1, 22.78),
(3, 20, 5, 1923.7),
(8, 29, 4, 1993.4),
(25, 24, 3, 911.16),
(13, 19, 5, 1933.0),
(23, 18, 1, 26.3),
(18, 47, 2, 45.56),
(21, 39, 5, 2492.4),
(19, 10, 4, 1799.76),
(15, 20, 4, 1538.96),
(5, 20, 4, 1538.96),
(21, 39, 5, 2492.4),
(18, 47, 5, 113.9),
(30, 43, 1, 142.04),
(23, 18, 4, 105.2),
(13, 4, 1, 248.09),
(11, 8, 3, 1489.98),
(24, 51, 4, 236.72),
(24, 51, 4, 236.72),
(16, 31, 1, 70.06),
(24, 51, 1, 59.18),
(28, 39, 2, 996.96),
(24, 51, 1, 59.18),
(3, 20, 3, 1154.22),
(7, 23, 1, 356.08),
(12, 1, 5, 986.65),
(16, 32, 1, 329.59),
(4, 1, 5, 986.65),
(5, 20, 4, 1538.96),
(6, 11, 4, 1465.28),
(15, 20, 3, 1154.22),
(25, 5, 3, 487.44),
(20, 31, 5, 350.3),
(21, 39, 5, 2492.4),
(11, 8, 1, 496.66),
(10, 31, 3, 210.18),
(9, 9, 4, 749.4),
(17, 14, 5, 992.8),
(24, 51, 1, 59.18),
(20, 32, 5, 1647.95),
(15, 20, 3, 1154.22),
(29, 27, 2, 626.4),
(9, 45, 2, 295.18),
(6, 18, 2, 52.6),
(18, 47, 2, 45.56),
(13, 19, 3, 1159.8),
(19, 10, 4, 1799.76),
(24, 51, 3, 177.54),
(9, 50, 4, 455.36),
(19, 10, 4, 1799.76),
(30, 1, 3, 591.99),
(4, 1, 4, 789.32),
(12, 1, 3, 591.99),
(7, 30, 4, 859.6),
(8, 46, 2, 619.86),
(15, 20, 1, 384.74),
(7, 30, 3, 644.7),
(19, 10, 1, 449.94),
(9, 27, 2, 626.4),
(24, 51, 5, 295.9),
(23, 11, 2, 732.64),
(7, 30, 2, 429.8),
(17, 12, 4, 1143.28),
(8, 46, 2, 619.86),
(27, 51, 5, 295.9),
(3, 20, 5, 1923.7),
(11, 8, 5, 2483.3),
(14, 49, 4, 1002.12),
(4, 33, 5, 1390.2),
(27, 51, 4, 236.72),
(17, 14, 5, 992.8),
(11, 8, 4, 1986.64),
(18, 47, 2, 45.56),
(26, 32, 2, 659.18),
(5, 20, 1, 384.74),
(2, 21, 2, 305.86),
(9, 36, 5, 1492.9),
(4, 26, 3, 1232.79),
(19, 10, 2, 899.88),
(30, 33, 4, 1112.16),
(2, 21, 4, 611.72),
(1, 33, 4, 1112.16),
(9, 36, 2, 597.16),
(20, 31, 1, 70.06),
(7, 17, 1, 195.16),
(8, 7, 3, 562.02),
(17, 12, 2, 571.64),
(18, 47, 2, 45.56),
(4, 26, 5, 2054.65),
(7, 17, 3, 585.48),
(23, 25, 5, 67.4),
(10, 32, 1, 329.59),
(9, 9, 1, 187.35),
(23, 11, 3, 1098.96),
(20, 32, 2, 659.18),
(9, 27, 2, 626.4),
(24, 51, 4, 236.72),
(27, 51, 5, 295.9);

COMMIT;
