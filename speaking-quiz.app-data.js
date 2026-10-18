/* ====================================================================
   MOCKS CAMBRIDGE — Speaking practice simulator (solo candidate)
   Motor compartido (byte a byte igual en nis.cohasset.pe, cohasset.pe y el
   standalone): la marca sale de window.MOCKS_SITE. Contenido ORIGINAL (no
   copiado de libros Cambridge); formato de cada nivel como el examen actual,
   adaptado a un candidato solo con el examinador = voz del navegador.
   Fotos: solo las del cache de Unsplash ya licenciado para Cohasset (url_small
   en hotlink + credito). IA: POST /cambridge/speaking/feedback.
   ==================================================================== */
var SP_PHOTOS = {"guitar":{"u":"https://images.unsplash.com/photo-1591685625141-ed011961f789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxGaWxtcyUyMGFuZCUyMG11c2ljfGVufDF8MHx8fDE3NzgyNjk3OTl8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"black acoustic guitar on black and white checkered textile","by":"Yusuf Onuk","l":"https://unsplash.com/photos/black-acoustic-guitar-on-black-and-white-checkered-textile-AtiHaRKACYA?utm_source=cohasset_language_center&utm_medium=referral"},"chess":{"u":"https://images.unsplash.com/photo-1689073016656-d8c0b43d4394?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxDb21wZXRpdGlvbiUyMCUyNiUyMFN0cmF0ZWd5fGVufDF8MHx8fDE3NzgyODAxNTN8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"a chess board with pieces of chess on it","by":"Anastassia Anufrieva","l":"https://unsplash.com/photos/a-chess-board-with-pieces-of-chess-on-it-HS-ubbd3zJo?utm_source=cohasset_language_center&utm_medium=referral"},"bikes":{"u":"https://images.unsplash.com/photo-1566148689376-e685c22ad48b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxNYW5hZ2VtZW50JTIwU3R5bGVzfGVufDF8MHx8fDE3NzgyODA4NTF8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"assorted-color bicycle lot","by":"Eric Prouzet","l":"https://unsplash.com/photos/assorted-color-bicycle-lot-I-svIUc2jvk?utm_source=cohasset_language_center&utm_medium=referral"},"reading_out":{"u":"https://images.unsplash.com/photo-1770304171975-4e2feedf3247?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxJbmZvcm1hbCUyMExldHRlcnN8ZW58MXwwfHx8MTc3ODI4Nzk2Mnww&ixlib=rb-4.1.0&q=80&w=400","alt":"A person reading an open book outdoors","by":"Syaiful Lil M","l":"https://unsplash.com/photos/a-person-reading-an-open-book-outdoors-gsyfkOn1BJ4?utm_source=cohasset_language_center&utm_medium=referral"},"basket":{"u":"https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxTcG9ydHN8ZW58MXwwfHx8MTc3ODI2OTk1NHww&ixlib=rb-4.1.0&q=80&w=400","alt":"silhouette of people playing basketball during sunset","by":"Jannes Glas","l":"https://unsplash.com/photos/silhouette-of-people-playing-basketball-during-sunset-0NaQQsLWLkA?utm_source=cohasset_language_center&utm_medium=referral"},"fruit":{"u":"https://images.unsplash.com/photo-1467453678174-768ec283a940?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxIZWFsdGh5JTIwbGlmZXN0eWxlfGVufDF8MHx8fDE3NzgyNzEwNDR8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"fruit lot on ceramic plate","by":"Jannis Brandt","l":"https://unsplash.com/photos/fruit-lot-on-ceramic-plate-8manzosDSGM?utm_source=cohasset_language_center&utm_medium=referral"},"egg":{"u":"https://images.unsplash.com/photo-1490645935967-10de6ba17061?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxGb29kJTIwZGlldCUyMCUyNiUyMHRoZSUyMHBhdGllbnR8ZW58MXwwfHx8MTc4MDU4NTM4NXww&ixlib=rb-4.1.0&q=80&w=400","alt":"poached egg with vegetables and tomatoes on blue plate","by":"Brooke Lark","l":"https://unsplash.com/photos/poached-egg-with-vegetables-and-tomatoes-on-blue-plate-jUPOXXRNdcA?utm_source=cohasset_language_center&utm_medium=referral"},"dish":{"u":"https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxGb29kJTIwZWF0aW5nJTIwb3V0JTIwJTI2JTIwaGVhbHRofGVufDF8MHx8fDE3ODA1OTg1MjF8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"cooked dish on gray bowl","by":"Lily Banse","l":"https://unsplash.com/photos/cooked-dish-on-gray-bowl--YHSwy6uqvk?utm_source=cohasset_language_center&utm_medium=referral"},"foodtable":{"u":"https://images.unsplash.com/photo-1565661834093-b749691b6c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxGb29kJTIwJTI2JTIwRW50ZXJ0YWluaW5nfGVufDF8MHx8fDE3NzgyNzczNDR8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"a table topped with lots of different types of food","by":"Melissa Walker Horn","l":"https://unsplash.com/photos/a-table-topped-with-lots-of-different-types-of-food-lBUaZVOCprI?utm_source=cohasset_language_center&utm_medium=referral"},"eatgroup":{"u":"https://images.unsplash.com/photo-1721180672399-0ff1a0d96abc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxDdWx0dXJlc3xlbnwxfDB8fHwxNzc4Mjc3ODA2fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"A group of people sitting around a table eating food","by":"DJ Paine","l":"https://unsplash.com/photos/a-group-of-people-sitting-around-a-table-eating-food-G4QFpOsoS7w?utm_source=cohasset_language_center&utm_medium=referral"},"train":{"u":"https://images.unsplash.com/photo-1772988384756-6fd38ebe9b3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxOZXR3b3JrJTIwc2VjdXJpdHklMjBhcmNoaXRlY3R1cmV8ZW58MXwwfHx8MTc3ODI2MzEwNXww&ixlib=rb-4.1.0&q=80&w=400","alt":"Train station platform with a lone person waiting","by":"Athar F","l":"https://unsplash.com/photos/train-station-platform-with-a-lone-person-waiting-UTJkS1tEycg?utm_source=cohasset_language_center&utm_medium=referral"},"cars":{"u":"https://images.unsplash.com/photo-1708191553091-0ec05dc82c48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxTaW1wbGUlMjB0cm91Ymxlc2hvb3Rpbmd8ZW58MXwwfHx8MTc3ODI1OTU4OXww&ixlib=rb-4.1.0&q=80&w=400","alt":"three cars driving down a highway next to each other","by":"Bernd 📷 Dittrich","l":"https://unsplash.com/photos/three-cars-driving-down-a-highway-next-to-each-other-0K2G2apr9M0?utm_source=cohasset_language_center&utm_medium=referral"},"moto":{"u":"https://images.unsplash.com/photo-1615506313305-e61daaa8cdcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxXaGF0JTIwY2FuJTIweW91JTIwZG8lMjBtb2JpbGl0eXxlbnwxfDB8fHwxNzgwNTg0OTkxfDA&ixlib=rb-4.1.0&q=80&w=400","alt":"man in brown jacket and black pants riding black and red motorcycle","by":"Jon Tyson","l":"https://unsplash.com/photos/man-in-brown-jacket-and-black-pants-riding-black-and-red-motorcycle-O7ke8N4kTpQ?utm_source=cohasset_language_center&utm_medium=referral"},"coupe":{"u":"https://images.unsplash.com/photo-1612475971749-cafca63b2634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxQb3dlciUyMGFuZCUyMGF1dGhvcml0eXxlbnwxfDB8fHwxNzc4Mjc1Nzk4fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"red audi coupe on road during daytime","by":"ixography","l":"https://unsplash.com/photos/red-audi-coupe-on-road-during-daytime-ERYG2OwPxk8?utm_source=cohasset_language_center&utm_medium=referral"},"library":{"u":"https://images.unsplash.com/photo-1769650796402-3d482464c5a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxBY2FkZW1pYyUyMHJlc2VhcmNoJTIwcmVhZGluZ3xlbnwxfDB8fHwxNzc4MjY1OTE3fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"Young woman sitting between bookshelves reading a book","by":"Jadon Johnson","l":"https://unsplash.com/photos/young-woman-sitting-between-bookshelves-reading-a-book-trdJtpDLyuY?utm_source=cohasset_language_center&utm_medium=referral"},"balloons":{"u":"https://images.unsplash.com/photo-1530789253388-582c481c54b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxUcmF2ZWwlMjAlMjYlMjB0b3VyaXNtfGVufDF8MHx8fDE3ODA1OTg0NDJ8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"man taking photo of hot air balloons","by":"Mesut Kaya","l":"https://unsplash.com/photos/man-taking-photo-of-hot-air-balloons-eOcyhe5-9sQ?utm_source=cohasset_language_center&utm_medium=referral"},"worker":{"u":"https://images.unsplash.com/photo-1759772238410-fa185c7947d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxDb25mbGljdCUyMGF0JTIwV29ya3xlbnwxfDB8fHwxNzc4Mjc4OTAyfDA&ixlib=rb-4.1.0&q=80&w=400","alt":"Worker in high-visibility vest on dirt path","by":"Illia Horokhovsky","l":"https://unsplash.com/photos/worker-in-high-visibility-vest-on-dirt-path-NKi2AhgDp-0?utm_source=cohasset_language_center&utm_medium=referral"},"office":{"u":"https://images.unsplash.com/photo-1761735486587-bcac08b15c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxWZW50dXJlJTIwQ2FwaXRhbCUyMCUyNiUyMEZ1bmRyYWlzaW5nfGVufDF8MHx8fDE3NzgyODI0MjB8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"Man working at a computer in an office.","by":"Invest Europe","l":"https://unsplash.com/photos/man-working-at-a-computer-in-an-office-8vbYa3T367Q?utm_source=cohasset_language_center&utm_medium=referral"},"fieldw":{"u":"https://images.unsplash.com/photo-1708592190055-b9a311e4fcd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxDU1IlMjAlMjYlMjBTdXN0YWluYWJpbGl0eXxlbnwxfDB8fHwxNzc4MjgxNDAwfDA&ixlib=rb-4.1.0&q=80&w=400","alt":"a group of women working in a field","by":"EqualStock","l":"https://unsplash.com/photos/a-group-of-women-working-in-a-field-7KhazgCqCNA?utm_source=cohasset_language_center&utm_medium=referral"},"nurse":{"u":"https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxIZWxwaW5nJTIwdGhlJTIwcGF0aWVudCUyMG9iamVjdCUyMHByb25vdW5zfGVufDF8MHx8fDE3ODA1ODUzMDd8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"woman in white scrub suit holding gray laptop computer","by":"National Cancer Institute","l":"https://unsplash.com/photos/woman-in-white-scrub-suit-holding-gray-laptop-computer-tl447mekwuQ?utm_source=cohasset_language_center&utm_medium=referral"},"vr":{"u":"https://images.unsplash.com/photo-1758524943150-37dba45aff1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxMaWZlJTIwZXhwZXJpZW5jZXN8ZW58MXwwfHx8MTc3ODI3MDgwOXww&ixlib=rb-4.1.0&q=80&w=400","alt":"Couple experiencing virtual reality together indoors.","by":"Vitaly Gariev","l":"https://unsplash.com/photos/couple-experiencing-virtual-reality-together-indoors--eTf5boWDaQ?utm_source=cohasset_language_center&utm_medium=referral"},"soccer":{"u":"https://images.unsplash.com/photo-1775005968274-a0078050accb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxGcmVlJTIwdGltZSUyMCUyNiUyMHNwb3J0fGVufDF8MHx8fDE3ODA1OTgyMDZ8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"Soccer players compete for the ball near the goal.","by":"Matheus Protzen","l":"https://unsplash.com/photos/soccer-players-compete-for-the-ball-near-the-goal-CHn91OHWpoI?utm_source=cohasset_language_center&utm_medium=referral"},"stadium":{"u":"https://images.unsplash.com/photo-1569863959165-56dae551d4fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxTcG9ydHMlMjBldmVudHN8ZW58MXwwfHx8MTc3ODI3MTU4Nnww&ixlib=rb-4.1.0&q=80&w=400","alt":"a large stadium filled with lots of people","by":"Piero Huerto Gago","l":"https://unsplash.com/photos/a-large-stadium-filled-with-lots-of-people-2rjjnfdlwGY?utm_source=cohasset_language_center&utm_medium=referral"},"bikelane":{"u":"https://images.unsplash.com/photo-1694267501942-6d7a0a14618c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxVcmJhbmlzbXxlbnwxfDB8fHwxNzc4Mjc0NjM0fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"a city street with a bike lane painted on it","by":"Marek Lumi","l":"https://unsplash.com/photos/a-city-street-with-a-bike-lane-painted-on-it-rD8DYirVIcA?utm_source=cohasset_language_center&utm_medium=referral"},"labgirl":{"u":"https://images.unsplash.com/photo-1633828763399-e29f1cd3f4c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxTY2llbmNlJTIwJTI2JTIwZGlzY292ZXJ5fGVufDF8MHx8fDE3ODA1OTg5ODl8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"a little girl wearing a white lab coat and goggles","by":"YY TEOH","l":"https://unsplash.com/photos/a-little-girl-wearing-a-white-lab-coat-and-goggles-WAEqUyi5CZQ?utm_source=cohasset_language_center&utm_medium=referral"},"booksgroup":{"u":"https://images.unsplash.com/photo-1763896081109-ed6bf56ae955?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxUaGUlMjBhcnQlMjBvZiUyMG5lZ290aWF0aW9ufGVufDF8MHx8fDE3NzgyNzY0MTh8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"Hands holding open books around a table","by":"Bill Ringer","l":"https://unsplash.com/photos/hands-holding-open-books-around-a-table-7C2JUQRJ5hE?utm_source=cohasset_language_center&utm_medium=referral"},"laptoptwo":{"u":"https://images.unsplash.com/photo-1690383923011-c63f619f6a5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxQcm9ibGVtcyUyMGF0JTIwV29ya3xlbnwxfDB8fHwxNzc4Mjc3MTg4fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"two men sitting at a table looking at a laptop","by":"Azwedo L.LC","l":"https://unsplash.com/photos/two-men-sitting-at-a-table-looking-at-a-laptop-nbEX3qxtmuA?utm_source=cohasset_language_center&utm_medium=referral"},"greenbuild":{"u":"https://images.unsplash.com/photo-1693517596637-8190ac7afc0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxTdXN0YWluYWJsZSUyMGNpdGllc3xlbnwxfDB8fHwxNzc4MjcyOTg5fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"a very tall building with lots of plants growing on it","by":"Zach Rowlandson","l":"https://unsplash.com/photos/a-very-tall-building-with-lots-of-plants-growing-on-it-qhK0hRwKU60?utm_source=cohasset_language_center&utm_medium=referral"},"fountain":{"u":"https://images.unsplash.com/photo-1744656165050-74d56587cbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxTdXN0YWluYWJpbGl0eSUyMCUyNiUyMEVTR3xlbnwxfDB8fHwxNzc4MjgxNzE2fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"A fountain flows in a lush garden.","by":"Zulfugar Karimov","l":"https://unsplash.com/photos/a-fountain-flows-in-a-lush-garden-jjPM8iNki2o?utm_source=cohasset_language_center&utm_medium=referral"},"hill":{"u":"https://images.unsplash.com/photo-1645974459635-7699f52e4a7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxUaGUlMjBuYXR1cmFsJTIwd29ybGR8ZW58MXwwfHx8MTc4MDU5OTQ1N3ww&ixlib=rb-4.1.0&q=80&w=400","alt":"a hill covered in green grass with a sky background","by":"Abhishek Singh","l":"https://unsplash.com/photos/a-hill-covered-in-green-grass-with-a-sky-background-ZFyAiXU3qkE?utm_source=cohasset_language_center&utm_medium=referral"},"toast":{"u":"https://images.unsplash.com/photo-1532634922-8fe0b757fb13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxGb29kJTIwYW5kJTIwZHJpbmt8ZW58MXwwfHx8MTc3ODI2ODAxM3ww&ixlib=rb-4.1.0&q=80&w=400","alt":"people having a toast","by":"Elevate","l":"https://unsplash.com/photos/people-having-a-toast-snnhGYNqm44?utm_source=cohasset_language_center&utm_medium=referral"},"selfie":{"u":"https://images.unsplash.com/photo-1758518731467-c2c48f5dc5ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxKb2IlMjBTYXRpc2ZhY3Rpb24lMjAlMjYlMjBFbmdhZ2VtZW50fGVufDF8MHx8fDE3NzgyODA2OTd8MA&ixlib=rb-4.1.0&q=80&w=400","alt":"Team celebrates success while taking a selfie","by":"Vitaly Gariev","l":"https://unsplash.com/photos/team-celebrates-success-while-taking-a-selfie-6KUkFVEWoEg?utm_source=cohasset_language_center&utm_medium=referral"},"sparkler":{"u":"https://images.unsplash.com/photo-1584549239925-5554aa6b9183?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5NDYwODl8MHwxfHNlYXJjaHwxfHxKb2JzJTIwaW4lMjBJVHxlbnwxfDB8fHwxNzc4MjU5NjY2fDA&ixlib=rb-4.1.0&q=80&w=400","alt":"man in black jacket holding lighted sparkler","by":"Kemal Kozbaev","l":"https://unsplash.com/photos/man-in-black-jacket-holding-lighted-sparkler-LgLqmEZy0Mo?utm_source=cohasset_language_center&utm_medium=referral"}};

/* ---- Tests. Cada test se expande a pasos (uno por respuesta grabada) en buildSteps(). ---- */
var SP_TESTS = {
A2:[
 {title:'Test 1 — Free time', p1:[
   "What's your name? Can you spell your family name for me?",
   "Where do you live?",
   "Do you work or do you study? Tell me something about it.",
   "What do you usually do in the morning?",
   "Tell me something about your family.",
   "What are you going to do this weekend?"],
  p2:{topic:'Free time', pics:[['guitar','playing the guitar'],['chess','playing chess'],['bikes','riding a bike'],['reading_out','reading a book'],['basket','playing basketball']],
   qs:["Do you like playing music? Why, or why not?","Do you like playing board games, like chess? Why, or why not?","How often do you ride a bike?","Do you like reading books? What kind of books?","Do you like playing sport with friends? Which sport?"],
   follow:["Which of these things do you like best? Why?","What do you do in your free time at the weekend?"]}},
 {title:'Test 2 — Food', p1:[
   "Hello. What's your name, and how old are you?",
   "Where are you from? Tell me something about your town.",
   "Who do you live with? Tell me something about them.",
   "What do you like to eat for dinner?",
   "Tell me something about your best friend.",
   "What did you do last weekend?"],
  p2:{topic:'Food', pics:[['fruit','fruit on a plate'],['egg','an egg with vegetables'],['dish','a hot meal in a bowl'],['foodtable','a table with lots of food'],['eatgroup','people eating together']],
   qs:["Do you like fruit? Which fruit do you like best?","What do you usually eat for breakfast?","Do you like hot meals, like rice or pasta? Why, or why not?","Do you like big meals with lots of different dishes? When do you have them?","Do you like eating with a group of people? Who do you eat with?"],
   follow:["Which meal of the day do you like best? Why?","Can you cook? Tell me about a dish you can make."]}},
 {title:'Test 3 — Getting around', p1:[
   "Good afternoon. What's your name? How do you spell your first name?",
   "Do you live in a house or a flat? Tell me something about it.",
   "What time do you get up on weekdays?",
   "What's your favourite day of the week? Why?",
   "Tell me something about a teacher you like.",
   "What do you want to do next summer?"],
  p2:{topic:'Travel and transport', pics:[['train','waiting at a train station'],['bikes','bicycles'],['cars','cars on a road'],['moto','a motorcycle'],['coupe','a fast car']],
   qs:["Do you travel by train? Where do you go?","Do you like riding a bicycle? Why, or why not?","How do you travel to school or work?","Would you like to ride a motorcycle? Why, or why not?","Would you like to have a fast car one day? Why?"],
   follow:["Which way of travelling do you like best? Why?","How did you travel the last time you went on holiday?"]}}
],
B1:[
 {title:'Test 1 — Study and trips', p1:[
   "What's your name, and where do you come from?",
   "Tell me about the place where you live.",
   "What do you do in the evenings?",
   "Do you prefer studying in the morning or in the afternoon? Why?",
   "Tell me about a trip you went on recently.",
   "What are you going to do next weekend?"],
  p2:{photo:'library', about:'a young woman reading between rows of bookshelves'},
  p3:{situation:"Your English class wants to celebrate the end of the school year with a day out.", options:['a theme park','a museum','the beach','a mountain walk','the cinema'], decide:"Which place do you think would be best for the class?"},
  p4:["Do you like going on days out with a group of people? Why, or why not?","What is the best place you have visited in your country?","Do you think it's better to go on a trip with friends or with family? Why?","How important is it to learn about the history of the place you live in?"]},
 {title:'Test 2 — Meals and presents', p1:[
   "Good morning. Can you tell me your name and a little about your family?",
   "What do you like most about your town or city?",
   "Tell me about your best friend.",
   "What kind of music do you listen to? Why?",
   "What did you do last weekend?",
   "Tell me about your plans for the summer."],
  p2:{photo:'eatgroup', about:'a group of people eating a meal together at a table'},
  p3:{situation:"A friend is moving to another country and you want to give them a goodbye present.", options:['a photo album','a book','a T-shirt with the name of your city','a box of chocolates','a plant'], decide:"Which present do you think would be best for your friend?"},
  p4:["Do you like giving presents? Why, or why not?","What was the best present you ever received?","Do you think people spend too much money on presents? Why?","Do you prefer to make presents or to buy them?"]},
 {title:'Test 3 — Clubs and free time', p1:[
   "What's your name? And how do you spell your surname?",
   "Do you work or study? What do you like about it?",
   "How do you usually get to school or work?",
   "Tell me about a meal you enjoyed recently.",
   "Do you like watching sport? Why, or why not?",
   "Where would you like to go on your next holiday?"],
  p2:{photo:'balloons', about:'a man taking a photo of hot air balloons in the sky'},
  p3:{situation:"Your school wants to start a new club for students after lessons.", options:['a cooking club','a film club','a football team','a drama group','a reading club'], decide:"Which club do you think would be the most popular?"},
  p4:["What do you do in your free time after school or work?","Do you think it's good for young people to join clubs? Why?","Would you prefer to do a sport or a creative activity with friends? Why?","How do you like to relax after a busy day?"]}
],
B2:[
 {title:'Test 1 — Jobs and community', p1:[
   "Where are you from, and what do you do there?",
   "What do you enjoy most about living in your town or city?",
   "How do you usually spend your weekends?",
   "Tell me about a person who has influenced you.",
   "How important is it for you to learn English? Why?",
   "What kind of job would you like to have in the future?"],
  p2:{photos:['worker','office'], q:"Why might the people have chosen these jobs? How might they be feeling?",
   partner:{photos:['fieldw','nurse'], q:"Which of these two jobs would you prefer to do?"}},
  p3:{q:"A town is going to build a new community centre. How could each of these help young people in the area?", prompts:['a sports hall','a library with study rooms','a café','free English classes','a music studio'], decide:"Now decide which of these would be the most useful for young people."},
  p4:["Do you think young people today have enough places to spend time together?","How important is it for people to take part in local community activities?","Some people say governments should spend more money on sports facilities. What do you think?","How do you think towns will change in the next twenty years?"]},
 {title:'Test 2 — Free time and environment', p1:[
   "Let's start with you. What's your name, and what's your background?",
   "What was the last thing you did that you really enjoyed?",
   "Do you prefer spending time at home or going out? Why?",
   "How has your daily life changed in the last few years?",
   "What do you think makes a good friend?",
   "Tell me about something you are looking forward to."],
  p2:{photos:['vr','reading_out'], q:"Why might the people have decided to spend their free time like this? How might they be feeling?",
   partner:{photos:['soccer','stadium'], q:"Which of these two activities do you think is more exciting? Why?"}},
  p3:{q:"How might each of these ideas help people to protect the environment?", prompts:['recycling bins in every street','cheaper public transport','banning plastic bags','teaching children about nature at school','planting more trees in cities'], decide:"Now decide which one would make the biggest difference."},
  p4:["What can individuals do in their daily lives to help the environment?","Do you think children learn enough about the environment at school?","Some people say it's too late to stop climate change. What's your opinion?","Is it better to change laws or to change people's habits? Why?"]},
 {title:'Test 3 — Travel and languages', p1:[
   "Can you tell us about your studies or your work?",
   "Which season do you like best, and why?",
   "How do you keep in touch with friends and family who live far away?",
   "What's the most interesting place you've ever visited?",
   "Do you usually plan things in advance, or do you prefer to decide at the last minute?",
   "What would you like to be doing in five years' time?"],
  p2:{photos:['train','moto'], q:"What are the good and bad things about travelling in these ways?",
   partner:{photos:['bikelane','cars'], q:"Which of these two ways of getting around is better for the environment? Why?"}},
  p3:{q:"Why might each of these be a good way to learn a language?", prompts:['attending a language course','living in another country','watching films and series','using a language app','chatting with a penfriend online'], decide:"Now decide which one would be the most effective for a beginner."},
  p4:["Do you think it's necessary for everyone to speak a foreign language? Why?","What do you find most difficult about learning a language?","Do you think children should start learning languages at a younger age?","How might technology change the way we learn languages in the future?"]}
],
C1:[
 {title:'Test 1 — Learning and work', p1:[
   "How would you describe the area where you grew up?",
   "What do you find most rewarding about your work or studies?",
   "Do you think the way you spend your free time has changed over the years?",
   "How do you usually deal with stress?",
   "Is there anything you've learned recently that surprised you?",
   "What are you hoping to achieve over the next few years?"],
  p2:{photos:['labgirl','booksgroup','laptoptwo'], q:"What might be the benefits and the difficulties of learning in these ways, and how might the people be feeling?", follow:"Which of these ways of learning do you think is the most effective? Why?"},
  p3:{q:"A company wants to help its employees to work more effectively. How might each of the following help?", prompts:['flexible working hours','training courses','a quiet space to work','team-building days','working from home'], decide:"Now decide which would be the most beneficial for the company as a whole."},
  p4:["Some people say job satisfaction is more important than salary. To what extent do you agree?","How is technology changing the way we work?","Do you think people today are expected to work too hard?","What qualities make someone a good leader in the workplace?"]},
 {title:'Test 2 — Places and cities', p1:[
   "Tell us a little about yourself and what brought you to study English.",
   "What do you think is the biggest difference between your generation and your parents'?",
   "How do you decide what to read or watch to keep up with the news?",
   "Is there a skill you've always wanted to develop?",
   "How important is it to you to travel, and why?",
   "What would your ideal working day look like?"],
  p2:{photos:['greenbuild','fountain','hill'], q:"What might be the appeal of spending time in these places, and what might be the drawbacks?", follow:"Which of these places would be the best for relaxing? Why?"},
  p3:{q:"Some cities want to make life better for their residents. How could each of these ideas improve city life?", prompts:['more green spaces','free public transport','banning cars from the centre','affordable housing','cultural festivals'], decide:"Now decide which one would make the most lasting difference."},
  p4:["Do you think city life is better than life in the countryside?","How far should governments control the use of cars in cities?","What responsibilities do residents have towards their neighbourhood?","How might cities look different in fifty years?"]},
 {title:'Test 3 — Celebrations and media', p1:[
   "What's your background, and what are you currently focusing on?",
   "How do you feel about the pace of life where you live?",
   "What role does music or art play in your life?",
   "Tell us about a decision you've made that changed things for you.",
   "How do you prefer to learn something new: alone, or with other people?",
   "If you could live anywhere in the world, where would it be, and why?"],
  p2:{photos:['toast','selfie','sparkler'], q:"Why might people want to celebrate in these ways, and how might they be feeling?", follow:"Which of these occasions do you think people remember for the longest time? Why?"},
  p3:{q:"Social media is part of daily life. What effect can each of these have on young people?", prompts:['keeping in touch with friends','comparing yourself with others','access to news','time spent online','finding new interests'], decide:"Now decide which of these effects is the most significant for society."},
  p4:["Do you think social media brings people closer together or pushes them apart?","How can young people be protected from the negative effects of the internet?","Is it right for companies to use our personal data? Why, or why not?","How might communication change over the next decade?"]}
]};

/* ---- Niveles: formato y tiempos (segundos de respuesta; prep = mirar la tarea) ---- */
var SP_LEVELS = {
 A2:{exam:'A2 Key', mins:'about 8 min', parts:'Part 1 interview · Part 2 discussion with pictures', t:{p1:20,pic:20,follow:25}},
 B1:{exam:'B1 Preliminary', mins:'about 10 min', parts:'Part 1 interview · Part 2 photo · Part 3 collaborative task · Part 4 discussion', t:{p1:20,p2:60,p3:120,p3d:40,p4:30,prep:15}},
 B2:{exam:'B2 First', mins:'about 12 min', parts:'Part 1 interview · Part 2 two photos · Part 3 mind map · Part 4 discussion', t:{p1:25,p2:60,p2b:30,p3:120,p3d:60,p4:40,prep:15}},
 C1:{exam:'C1 Advanced', mins:'about 14 min', parts:'Part 1 interview · Part 2 three photos · Part 3 mind map · Part 4 discussion', t:{p1:30,p2:60,p2b:30,p3:120,p3d:60,p4:45,prep:15}}
};

/* ---- Criterios y autoevaluacion (resumen propio de los descriptores publicos, bandas 3 y 5) ---- */
var SP_CRIT = {
 GrammarVocabulary:'Grammar and Vocabulary', DiscourseManagement:'Discourse Management',
 GrammaticalResource:'Grammatical Resource', LexicalResource:'Lexical Resource'
};
var SP_LEVEL_CRIT = {A2:['GrammarVocabulary'], B1:['GrammarVocabulary','DiscourseManagement'], B2:['GrammarVocabulary','DiscourseManagement'], C1:['GrammaticalResource','LexicalResource','DiscourseManagement']};
var SP_SELF = {
 A2:{GrammarVocabulary:[
   "Band 3: you control simple structures well enough to be understood, and your words fit everyday topics (family, food, free time).",
   "Band 5: you control simple structures well, even try a few longer ones, and use a good range of everyday words."]},
 B1:{GrammarVocabulary:[
   "Band 3: simple forms are mostly accurate; you have the words to talk about familiar topics and give basic personal information.",
   "Band 5: simple forms are accurate, you control some more complex forms (e.g. conditionals, past perfect), and your vocabulary is varied on familiar topics."],
  DiscourseManagement:[
   "Band 3: your answers are mostly relevant, with some repetition or pauses; you link ideas with basic words (and, but, because).",
   "Band 5: you speak in longer stretches despite some hesitation; ideas are relevant, organised and linked with a range of connectors."]},
 B2:{GrammarVocabulary:[
   "Band 3: good control of simple forms and some control of complex ones; appropriate vocabulary for familiar topics.",
   "Band 5: a good range of simple and complex forms with only occasional slips; vocabulary is wide enough for unfamiliar topics too."],
  DiscourseManagement:[
   "Band 3: you keep going in longer turns with some hesitation; mostly relevant, some repetition; basic linking.",
   "Band 5: long turns with very little hesitation; ideas are coherent and well organised, with a range of linking devices."]},
 C1:{GrammaticalResource:[
   "Band 3: good control of simple and complex forms; errors are occasional and do not get in the way.",
   "Band 5: you keep control of a wide range of structures, including sophisticated ones, with only rare slips."],
  LexicalResource:[
   "Band 3: appropriate vocabulary on familiar and unfamiliar topics; you can work around gaps.",
   "Band 5: wide, flexible vocabulary including idiomatic and less common items, used precisely."],
  DiscourseManagement:[
   "Band 3: extended turns with little hesitation, mostly relevant and coherent; clear linking.",
   "Band 5: fluent extended turns, effectively organised, with natural and varied cohesion; contributions fully relevant."]}
};
var SP_SELF_OTHER = {
 Pronunciation:"Is your word stress right? Do your sentences have a natural rhythm and intonation? Would a listener who does not know you understand you easily? Listen to your recording to check.",
 Interaction:"Do you react to the question and develop your answer? In Part 3, did you ask yourself questions, react to the ideas and reach a decision? (A real partner is needed to mark this.)"
};

(function(){
'use strict';
var MSITE = Object.assign({schoolName:'', portalName:'the Portal', logo:'', logoAlt:''}, window.MOCKS_SITE || {});
var app = document.getElementById('app');
var S = {view:'home', level:null, ti:0, steps:[], idx:0, answers:[], session:null, history:[]};
var R = {stream:null, mr:null, chunks:[], sr:null, recording:false, buf:'', curFinal:'', interim:'', startedAt:0, mime:'',
         timer:null, phase:'', srDead:false, srErr:0, deadline:0, tok:0, u:null, ttsFail:null, busy:false, hasMic:false};

function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function words(s){ s = (s || '').trim(); return s ? s.split(/\s+/).length : 0; }
function pad2(n){ return (n < 10 ? '0' : '') + n; }
function mmss(sec){ return pad2(Math.floor(sec / 60)) + ':' + pad2(sec % 60); }
function ph(id){ return SP_PHOTOS[id] || null; }
function letter(i){ return String.fromCharCode(65 + i); }

/* ===================== estilos propios (usan las variables de la piel de cada web) ===================== */
var css = [
'.sp-wrap{max-width:920px;margin:0 auto}',
'.sp-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}',
'.sp-top img{height:38px;width:auto}',
'.sp-top .sp-crumb{color:var(--muted);font-size:.9rem}',
'.sp-top .sp-right{margin-left:auto;display:flex;gap:8px;align-items:center}',
'.sp-btn2{background:var(--card);color:var(--muted);border:1px solid var(--line);padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9rem}',
'.sp-levels{grid-template-columns:1fr 1fr!important}',
'.sp-tests{display:grid;gap:12px;margin-top:10px}',
'.sp-testcard{border:1px solid var(--line);border-radius:14px;padding:16px 18px;background:var(--card);cursor:pointer;text-align:left;display:block;width:100%;font:inherit;color:inherit}',
'.sp-testcard:hover{border-color:var(--accent);box-shadow:0 0 0 3px var(--soft)}',
'.sp-testcard b{display:block;font-size:1.05rem}',
'.sp-testcard span{color:var(--muted);font-size:.88rem}',
'.sp-note{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;padding:10px 14px;margin:10px 0;font-size:.9rem;color:var(--muted)}',
'.sp-warn{border-left-color:var(--warn,#f59e0b)}',
'.sp-prog{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0 12px}',
'.sp-prog i{display:block;width:22px;height:6px;border-radius:3px;background:var(--line)}',
'.sp-prog i.on{background:var(--accent)}',
'.sp-prog i.cur{background:var(--accent);box-shadow:0 0 0 2px var(--soft)}',
'.sp-part{font-weight:800;color:var(--accent-txt,var(--accent));font-size:.95rem}',
'.sp-instr{color:var(--muted);font-size:.88rem;margin:2px 0 10px}',
'.sp-ask{font-size:1.15rem;font-weight:700;margin:8px 0 12px;line-height:1.4}',
'.sp-figs{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0}',
'.sp-fig{margin:0;position:relative;flex:1 1 220px;max-width:340px}',
'.sp-fig.sm{flex:0 1 150px;max-width:170px}',
'.sp-fig img{width:100%;height:auto;display:block;border-radius:10px;border:1px solid var(--line);background:var(--bg);min-height:90px;object-fit:cover}',
'.sp-fig.hi img{box-shadow:0 0 0 4px var(--accent)}',
'.sp-fig .sp-let{position:absolute;left:8px;top:8px;background:var(--accent);color:#fff;border-radius:6px;padding:1px 8px;font-weight:800;font-size:.85rem}',
'.sp-fig figcaption{font-size:.72rem;color:var(--muted);margin-top:3px}',
'.sp-fig figcaption a{color:inherit}',
'.sp-piclabel{font-size:.78rem;color:var(--muted);text-align:center}',
'.sp-opts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}',
'.sp-opt{border:1px solid var(--line);background:var(--bg);border-radius:20px;padding:7px 14px;font-weight:600;font-size:.92rem}',
'.sp-mind{display:flex;flex-direction:column;align-items:center;gap:10px;margin:8px 0}',
'.sp-mind .c{border:2px solid var(--accent);border-radius:14px;padding:12px 16px;font-weight:700;text-align:center;max-width:560px;background:var(--card)}',
'.sp-mind .ring{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}',
'.sp-mind .ring span{border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:8px 12px;font-size:.92rem}',
'.sp-timer{font-family:Consolas,monospace;font-weight:800;font-size:3.6rem;line-height:1;text-align:center;letter-spacing:3px;margin:12px 0 2px;color:var(--accent-txt,var(--accent))}',
'.sp-timer.low{color:var(--bad,#dc2626);animation:spPulse 1s infinite}',
'.sp-timer.ask{color:var(--muted)}',
'@keyframes spPulse{50%{opacity:.6}}',
'.sp-state{text-align:center;font-weight:700;margin:0 0 6px}',
'.sp-dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--bad,#dc2626);margin-right:6px;animation:spPulse 1s infinite}',
'.sp-live{min-height:44px;background:var(--bg);border:1px dashed var(--line);border-radius:8px;padding:8px 12px;color:var(--muted);font-size:.9rem;margin:10px 0}',
'.sp-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:12px}',
'.sp-ans{border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:12px;background:var(--card)}',
'.sp-ans .h{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:.85rem;color:var(--muted)}',
'.sp-ans .q{font-weight:700;margin:6px 0}',
'.sp-ans audio{width:100%;margin:6px 0}',
'.sp-ans textarea{width:100%;min-height:80px;border:1px solid var(--line);border-radius:8px;padding:10px;font-size:.95rem;line-height:1.5;background:var(--card);color:inherit;resize:vertical}',
'.sp-mark{margin:10px 0}',
'.sp-mark .r{display:flex;justify-content:space-between;gap:8px}',
'.sp-bar{height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-top:3px}',
'.sp-bar i{display:block;height:100%}',
'.sp-total{font-size:2.4rem;font-weight:800;text-align:center}',
'.sp-sub{color:var(--muted);font-size:.88rem}',
'.sp-self label{display:block;margin:4px 0;font-size:.9rem}',
'.sp-hist{display:flex;gap:10px;align-items:center;flex-wrap:wrap;border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:10px;background:var(--card)}',
'.sp-hist .t{flex:1 1 200px}',
'@media(max-width:560px){.sp-timer{font-size:2.8rem}}'
].join('\n');
(function(){ try{ var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }catch(e){} })();

/* ===================== construccion de pasos ===================== */
function photoDesc(ids){ return ids.map(function(id, i){ return 'Photo ' + letter(i) + ': ' + (ph(id) ? ph(id).alt : id); }).join('. '); }

function buildSteps(level, t){
  var L = SP_LEVELS[level].t, st = [];
  function add(o){ o.n = st.length; st.push(o); }
  t.p1.forEach(function(q, i){
    add({part:1, pname:'Part 1 — Interview', task:'Part 1 interview, question ' + (i + 1), say:(i === 0 ? 'Good day. ' : '') + q,
      prompt:'Part 1 interview. The examiner asks: "' + q + '"', secs:L.p1, prep:0, show:{type:'q', text:q},
      instr:'The examiner asks you about yourself. Answer each question with a full sentence or two.'});
  });
  var p;
  if(level === 'A2'){
    p = t.p2;
    var pd = p.pics.map(function(x, i){ return (i + 1) + ') ' + x[1]; }).join('; ');
    var ids = p.pics.map(function(x){ return x[0]; }), labs = p.pics.map(function(x){ return x[1]; });
    p.qs.forEach(function(q, i){
      add({part:2, pname:'Part 2 — Discussion with pictures', task:'Part 2 pictures (' + p.topic + '), picture ' + (i + 1),
        say:(i === 0 ? "Now, let's talk about " + p.topic.toLowerCase() + '. Look at the pictures. ' : '') + q,
        prompt:'Part 2 discussion about one topic (' + p.topic + '). Five pictures are shown: ' + pd + '. About picture ' + (i + 1) + ' (' + p.pics[i][1] + ') the examiner asks: "' + q + '"',
        secs:L.pic, prep:0, show:{type:'pics', ids:ids, labels:labs, hi:i, text:q},
        instr:'Look at the pictures. The examiner asks what you think about each one. Give a reason when you can.'});
    });
    p.follow.forEach(function(q){
      add({part:2, pname:'Part 2 — Discussion with pictures', task:'Part 2 pictures (' + p.topic + '), follow-up question',
        say:q, prompt:'Part 2 follow-up question about the topic ' + p.topic + ' (pictures: ' + pd + '). The examiner asks: "' + q + '"',
        secs:L.follow, prep:0, show:{type:'pics', ids:ids, labels:labs, hi:-1, text:q}, instr:'A last question about the same topic.'});
    });
    return st;
  }
  p = t.p2;
  if(level === 'B1'){
    add({part:2, pname:'Part 2 — Describe a photograph', task:'Part 2 describe one photograph (1 minute)',
      say:'Now I am going to give you a photograph. Please tell me what you can see in the photograph. You have about one minute.',
      prompt:'Part 2: the candidate describes one photograph for about one minute. The photograph shows ' + p.about + ' (' + (ph(p.photo) ? ph(p.photo).alt : '') + '). Task: say what you can see in the photograph.',
      secs:L.p2, prep:L.prep, show:{type:'photos', ids:[p.photo], q:'Describe the photograph. Say what you can see: where it is, who the people are, what they are doing.'},
      instr:'Look at the photograph for a few seconds, then talk for about one minute. Say what you can see.'});
  } else if(level === 'B2'){
    add({part:2, pname:'Part 2 — Compare two photographs', task:'Part 2 long turn: compare two photographs (1 minute)',
      say:'Here are your two photographs. I would like you to compare the photographs and answer this question. ' + p.q + ' You have about one minute.',
      prompt:'Part 2 long turn (about 1 minute). ' + photoDesc(p.photos) + '. Printed question: "' + p.q + '" The candidate compares the photographs and answers the question.',
      secs:L.p2, prep:L.prep, show:{type:'photos', ids:p.photos, q:p.q},
      instr:'Compare the two photographs and answer the question printed above them. Talk for about one minute.'});
    add({part:2, pname:'Part 2 — Compare two photographs', task:'Part 2 short answer about the other candidate\'s photographs (30 seconds)',
      say:'Thank you. Now your partner has also talked about two photographs. Here is a short question for you about them. ' + p.partner.q,
      prompt:'Part 2 short answer (about 30 seconds) about the other candidate\'s photographs. ' + photoDesc(p.partner.photos) + '. Question: "' + p.partner.q + '"',
      secs:L.p2b, prep:0, show:{type:'photos', ids:p.partner.photos, q:p.partner.q, small:true, head:"Your partner's photographs"},
      instr:'Answer the short question about your partner\'s photographs in about 30 seconds.'});
  } else {
    add({part:2, pname:'Part 2 — Compare photographs', task:'Part 2 long turn: compare two of three photographs (1 minute)',
      say:'Here are your three photographs. Choose two of them and compare them. ' + p.q + ' You have about one minute.',
      prompt:'Part 2 long turn (about 1 minute). Three photographs are shown and the candidate chooses two to compare. ' + photoDesc(p.photos) + '. Printed question: "' + p.q + '"',
      secs:L.p2, prep:L.prep, show:{type:'photos', ids:p.photos, q:'Choose two photographs and compare them. ' + p.q},
      instr:'Choose two of the three photographs, compare them and answer the question. Talk for about one minute.'});
    add({part:2, pname:'Part 2 — Compare photographs', task:'Part 2 short answer about the same photographs (30 seconds)',
      say:'Thank you. Now, a short question about the same photographs. ' + p.follow,
      prompt:'Part 2 short answer (about 30 seconds) about the same three photographs. ' + photoDesc(p.photos) + '. Question: "' + p.follow + '"',
      secs:L.p2b, prep:0, show:{type:'photos', ids:p.photos, q:p.follow, small:true},
      instr:'Answer the short question in about 30 seconds.'});
  }
  var p3 = t.p3, solo = 'You are on your own: talk as if you were speaking to a partner. Ask yourself questions, react to your own ideas, then decide.';
  if(level === 'B1'){
    add({part:3, pname:'Part 3 — Collaborative task', task:'Part 3 collaborative task: discuss the options (2 minutes)',
      say:p3.situation + ' Here are some ideas. Talk about the different options and say what is good or not so good about each one.',
      prompt:'Part 3 collaborative task (solo candidate talking as if to a partner, about 2 minutes). Situation: ' + p3.situation + ' Options: ' + p3.options.join('; ') + '. Task: talk about the options.',
      secs:L.p3, prep:L.prep, show:{type:'options', situation:p3.situation, options:p3.options}, instr:solo});
    add({part:3, pname:'Part 3 — Collaborative task', task:'Part 3 decision (about 40 seconds)',
      say:'Thank you. Now decide together. ' + p3.decide,
      prompt:'Part 3 decision. Situation: ' + p3.situation + ' Options: ' + p3.options.join('; ') + '. Question: "' + p3.decide + '"',
      secs:L.p3d, prep:0, show:{type:'options', situation:p3.situation, options:p3.options, q:p3.decide}, instr:'Now decide which option is best and say why.'});
  } else {
    add({part:3, pname:'Part 3 — Collaborative task', task:'Part 3 mind map: discuss the ideas (2 minutes)',
      say:'Now I would like you to talk about something together. ' + p3.q + ' You have two minutes.',
      prompt:'Part 3 collaborative task with a mind map (solo candidate talking as if to a partner, about 2 minutes). Central question: "' + p3.q + '" Ideas: ' + p3.prompts.join('; ') + '.',
      secs:L.p3, prep:L.prep, show:{type:'mind', q:p3.q, prompts:p3.prompts}, instr:solo});
    add({part:3, pname:'Part 3 — Collaborative task', task:'Part 3 decision (1 minute)',
      say:'Thank you. Now you have about a minute to decide. ' + p3.decide,
      prompt:'Part 3 decision question (about 1 minute). Mind map: "' + p3.q + '" Ideas: ' + p3.prompts.join('; ') + '. Question: "' + p3.decide + '"',
      secs:L.p3d, prep:0, show:{type:'mind', q:p3.decide, prompts:p3.prompts}, instr:'Now decide, and give reasons for your choice.'});
  }
  t.p4.forEach(function(q, i){
    add({part:4, pname:'Part 4 — Discussion', task:'Part 4 discussion, question ' + (i + 1),
      say:(i === 0 ? "Now let's talk more generally. " : '') + q, prompt:'Part 4 general discussion. The examiner asks: "' + q + '"',
      secs:L.p4, prep:0, show:{type:'q', text:q}, instr:'The examiner asks for your opinion. Give reasons and examples.'});
  });
  return st;
}

/* ===================== almacenamiento: IndexedDB coh_cam_speaking (con memoria si no hay) ===================== */
var DB = null, MEM = {sessions:{}, answers:{}};
function dbOpen(){
  return new Promise(function(res){
    try{
      if(!window.indexedDB){ res(null); return; }
      var rq = indexedDB.open('coh_cam_speaking', 1);
      rq.onupgradeneeded = function(){
        var d = rq.result;
        if(!d.objectStoreNames.contains('sessions')) d.createObjectStore('sessions', {keyPath:'id'});
        if(!d.objectStoreNames.contains('answers')){ var s = d.createObjectStore('answers', {keyPath:'key'}); s.createIndex('sid', 'sid', {unique:false}); }
      };
      rq.onsuccess = function(){ res(rq.result); };
      rq.onerror = function(){ res(null); };
      rq.onblocked = function(){ res(null); };
    }catch(e){ res(null); }
  });
}
function dbReady(){ if(DB !== null) return Promise.resolve(DB); return dbOpen().then(function(d){ DB = d || false; return DB; }); }
function dbOp(store, mode, fn){
  return dbReady().then(function(d){
    if(!d) return null;
    return new Promise(function(res){
      try{
        var tx = d.transaction(store, mode), os = tx.objectStore(store), out = fn(os);
        tx.oncomplete = function(){ res(out && out.result !== undefined ? out.result : (out && out.items) || null); };
        tx.onerror = function(){ res(null); }; tx.onabort = function(){ res(null); };
      }catch(e){ res(null); }
    });
  });
}
function putSession(s){ MEM.sessions[s.id] = s; return dbOp('sessions', 'readwrite', function(os){ return os.put(s); }); }
function putAnswer(a){ MEM.answers[a.key] = a; return dbOp('answers', 'readwrite', function(os){ return os.put(a); }); }
function allSessions(){
  return dbReady().then(function(d){
    if(!d) return Object.keys(MEM.sessions).map(function(k){ return MEM.sessions[k]; });
    return new Promise(function(res){
      var items = [];
      try{
        var tx = d.transaction('sessions', 'readonly'), rq = tx.objectStore('sessions').openCursor();
        rq.onsuccess = function(){ var c = rq.result; if(c){ items.push(c.value); c.continue(); } };
        tx.oncomplete = function(){ res(items); }; tx.onerror = function(){ res(items); }; tx.onabort = function(){ res(items); };
      }catch(e){ res(items); }
    });
  });
}
function answersOf(sid){
  return dbReady().then(function(d){
    if(!d) return Object.keys(MEM.answers).map(function(k){ return MEM.answers[k]; }).filter(function(a){ return a.sid === sid; });
    return new Promise(function(res){
      var items = [];
      try{
        var tx = d.transaction('answers', 'readonly'), rq = tx.objectStore('answers').index('sid').openCursor(IDBKeyRange.only(sid));
        rq.onsuccess = function(){ var c = rq.result; if(c){ items.push(c.value); c.continue(); } };
        tx.oncomplete = function(){ res(items); }; tx.onerror = function(){ res(items); }; tx.onabort = function(){ res(items); };
      }catch(e){ res(items); }
    });
  });
}
function deleteSession(sid){
  delete MEM.sessions[sid];
  return answersOf(sid).then(function(list){
    list.forEach(function(a){ delete MEM.answers[a.key]; });
    return dbOp('answers', 'readwrite', function(os){ list.forEach(function(a){ os.delete(a.key); }); return null; });
  }).then(function(){ return dbOp('sessions', 'readwrite', function(os){ return os.delete(sid); }); });
}

/* ===================== audio: voz del examinador ===================== */
function pickVoice(){
  try{
    var vs = speechSynthesis.getVoices() || [], i, gb = [];
    for(i = 0; i < vs.length; i++) if(String(vs[i].lang).replace('_', '-').toLowerCase() === 'en-gb') gb.push(vs[i]);
    if(gb.length){
      for(i = 0; i < gb.length; i++) if(/daniel|serena|kate|google uk|female/i.test(gb[i].name)) return gb[i];
      return gb[0];
    }
    for(i = 0; i < vs.length; i++) if(/^en/i.test(vs[i].lang)) return vs[i];
  }catch(e){}
  return null;
}
function unlockTTS(){
  /* Dentro del gesto del usuario (iOS): habla un espacio en silencio para habilitar la sintesis. */
  try{
    if(!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    var u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'en-GB'; speechSynthesis.speak(u);
  }catch(e){}
}
function stopSpeech(){ R.tok++; clearTimeout(R.ttsFail); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} }
function speak(text, done){
  var tok = ++R.tok, finished = false;
  clearTimeout(R.ttsFail);
  function fin(){ if(finished || tok !== R.tok) return; finished = true; clearTimeout(R.ttsFail); done(); }
  if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){ R.ttsFail = setTimeout(fin, Math.min(7000, 1500 + words(text) * 330)); return; }
  try{
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB';
    var v = pickVoice(); if(v) u.voice = v;
    u.rate = 0.92; u.onend = fin; u.onerror = fin; R.u = u;
    speechSynthesis.speak(u);
    R.ttsFail = setTimeout(fin, 5000 + words(text) * 650);
  }catch(e){ fin(); }
}

/* ===================== grabacion + transcripcion ===================== */
function supportedMime(){
  if(typeof MediaRecorder === 'undefined') return '';
  var c = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
  for(var i = 0; i < c.length; i++){ try{ if(MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c[i])) return c[i]; }catch(e){} }
  return '';
}
var SRClass = window.SpeechRecognition || window.webkitSpeechRecognition || null;
function requestMic(){
  return new Promise(function(res){
    try{
      if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ res(null); return; }
      var settled = false;
      var to = setTimeout(function(){ if(!settled){ settled = true; res(null); } }, 25000);   /* permiso sin contestar: seguir sin microfono */
      navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
        clearTimeout(to);
        if(settled){ try{ s.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} return; }
        settled = true; res(s);
      }, function(){ clearTimeout(to); if(!settled){ settled = true; res(null); } });
    }catch(e){ res(null); }
  });
}
function releaseMic(){ try{ if(R.stream) R.stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} R.stream = null; R.hasMic = false; }
function liveText(){ return (R.buf + ' ' + R.curFinal + ' ' + R.interim).replace(/\s+/g, ' ').trim(); }
function paintLive(){ var el = document.getElementById('spLive'); if(el) el.textContent = liveText() || (SRClass && !R.srDead ? 'Listening… your words will appear here.' : 'Live transcript is not available in this browser: you can type your answers on the next screen.'); }
function startSR(){
  if(!SRClass || R.srDead) return;
  try{
    var sr = new SRClass(); R.sr = sr; sr.lang = 'en-GB'; sr.continuous = true; sr.interimResults = true;
    sr.onresult = function(e){
      var f = '', it = '';
      for(var i = 0; i < e.results.length; i++){ if(e.results[i].isFinal) f += e.results[i][0].transcript + ' '; else it += e.results[i][0].transcript + ' '; }
      R.curFinal = f; R.interim = it; R.srErr = 0; paintLive();
    };
    sr.onerror = function(e){
      var er = e && e.error;
      if(er === 'not-allowed' || er === 'service-not-allowed' || er === 'language-not-supported'){ R.srDead = true; return; }
      if(er === 'network' || er === 'aborted'){ R.srErr++; if(R.srErr > 4) R.srDead = true; }
    };
    sr.onend = function(){
      R.buf = (R.buf + ' ' + R.curFinal + ' ' + R.interim).replace(/\s+/g, ' ').trim(); R.curFinal = ''; R.interim = '';
      if(R.recording && !R.srDead){ setTimeout(function(){ if(R.recording && !R.srDead) startSR(); }, 150); }
    };
    sr.start();
  }catch(e){ R.srErr++; }
}
function beginCapture(){
  R.buf = ''; R.curFinal = ''; R.interim = ''; R.chunks = []; R.mr = null; R.recording = true; R.startedAt = Date.now(); R.mime = '';
  if(R.stream && typeof MediaRecorder !== 'undefined'){
    try{
      var m = supportedMime();
      R.mr = m ? new MediaRecorder(R.stream, {mimeType:m}) : new MediaRecorder(R.stream);
      R.mime = m || R.mr.mimeType || '';
      R.mr.ondataavailable = function(e){ if(e.data && e.data.size) R.chunks.push(e.data); };
      R.mr.start();
    }catch(e){ R.mr = null; }
  }
  startSR(); paintLive();
}
function stopCapture(){
  return new Promise(function(res){
    var seconds = Math.max(0, Math.round((Date.now() - R.startedAt) / 1000)), done = false;
    R.recording = false;
    try{ if(R.sr) R.sr.stop(); }catch(e){}
    function fin(blob){
      if(done) return; done = true;
      setTimeout(function(){
        var tr = (R.buf + ' ' + R.curFinal + ' ' + R.interim).replace(/\s+/g, ' ').trim();
        res({blob:blob, mime:R.mime || (blob && blob.type) || '', seconds:seconds, transcript:tr});
      }, 450);
    }
    if(R.mr && R.mr.state !== 'inactive'){
      R.mr.onstop = function(){ fin(R.chunks.length ? new Blob(R.chunks, {type:R.mime || R.mr.mimeType || 'audio/webm'}) : null); };
      try{ R.mr.stop(); }catch(e){ fin(null); }
    } else fin(null);
  });
}

/* ===================== pantallas ===================== */
function topbar(crumb, extra){
  return '<div class="sp-top">' + (MSITE.logo ? '<img src="' + esc(MSITE.logo) + '" alt="' + esc(MSITE.logoAlt) + '">' : '') +
    '<span class="sp-crumb">' + crumb + '</span><span class="sp-right">' + (extra || '') + '</span></div>';
}
function setView(v){ S.view = v; try{ window.scrollTo(0, 0); }catch(e){} }

function viewHome(){
  /* ?level=A2|B1|B2|C1 (tarjeta de nivel): salta la elección de nivel, solo la primera vez. */
  var _ql = new URLSearchParams(location.search).get('level');
  if(_ql && SP_LEVELS[_ql] && SP_TESTS[_ql] && !window._levelUsed){ window._levelUsed = true; S.level = _ql; return viewTests(); }
  setView('home'); app.className = 'app';
  app.innerHTML = '<div class="hero">' + (MSITE.logo ? '<img src="' + esc(MSITE.logo) + '" alt="' + esc(MSITE.logoAlt) + '">' : '') +
    '<h1>Cambridge — Speaking</h1>' +
    '<p class="sub">Practise the Cambridge Speaking test on your own. A virtual examiner asks the questions, you answer out loud, and the AI gives you orientative feedback.</p>' +
    '<div class="levels sp-levels">' + ['A2', 'B1', 'B2', 'C1'].map(function(l){
      return '<div class="level-card" data-act="level" data-l="' + l + '"><div class="lv">' + l + '</div><div class="nm">' + esc(SP_LEVELS[l].exam) + '</div></div>';
    }).join('') + '</div>' +
    '<p style="margin-top:16px"><button class="btn ghost" data-act="history">My sessions</button></p>' +
    '<p style="margin-top:10px"><a class="link" href="quizzes.html">&larr; Back to Practice tests</a></p></div>';
}
function viewTests(){
  setView('tests'); app.className = 'app';
  var lv = SP_LEVELS[S.level];
  app.innerHTML = '<div class="sp-wrap">' + topbar('Cambridge tests &rsaquo; Speaking &rsaquo; ' + esc(S.level)) +
    '<h1 style="margin:0 0 4px;font-size:1.6rem">' + esc(lv.exam) + ' — Speaking practice</h1>' +
    '<p class="sp-sub" style="margin:0 0 6px">' + esc(lv.parts) + ' · ' + esc(lv.mins) + '</p>' +
    '<div class="sp-tests">' + SP_TESTS[S.level].map(function(t, i){
      var n = buildSteps(S.level, t).length;
      return '<button type="button" class="sp-testcard" data-act="test" data-i="' + i + '"><b>' + esc(t.title) + '</b><span>' + n + ' questions · ' + esc(lv.mins) + '</span></button>';
    }).join('') + '</div>' +
    '<p style="margin-top:16px"><a class="link" href="#" data-act="home">&larr; Back to levels</a></p></div>';
}
function viewPrepare(){
  setView('prep'); app.className = 'app';
  var lv = SP_LEVELS[S.level], t = SP_TESTS[S.level][S.ti];
  var warns = [];
  if(!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || typeof MediaRecorder === 'undefined') warns.push('This browser cannot record audio. You can still do the test, and type what you said on the review screen.');
  if(!SRClass) warns.push('This browser cannot turn your speech into text automatically. You will type or paste your answers on the review screen (Chrome and recent Safari can transcribe).');
  if(!window.speechSynthesis) warns.push('This browser has no examiner voice: read the questions on the screen.');
  app.innerHTML = '<div class="sp-wrap">' + topbar('Cambridge tests &rsaquo; Speaking &rsaquo; ' + esc(S.level) + ' &rsaquo; ' + esc(t.title)) +
    '<div class="card"><h2>' + esc(lv.exam) + ' — ' + esc(t.title) + '</h2>' +
    '<ul style="margin:6px 0 10px 18px;padding:0;line-height:1.7">' +
    '<li>Find a quiet place and use headphones if you can.</li>' +
    '<li>The examiner asks each question aloud (a British voice). Photos and prompts appear on screen.</li>' +
    '<li>Where the format has it, you get a few seconds to look at the task. Then recording starts by itself and a big countdown shows your time.</li>' +
    '<li>Press <b>Next</b> when you finish early. When the time ends, recording stops; press Next to continue.</li>' +
    '<li>At the end you can listen to yourself, correct the transcript and ask the AI for feedback.</li></ul>' +
    '<div class="sp-note">Your browser will ask for permission to use the microphone. Recordings stay on this device.</div>' +
    warns.map(function(w){ return '<div class="sp-note sp-warn">' + esc(w) + '</div>'; }).join('') +
    '<div class="row"><button class="btn" data-act="start">Start the test</button><button class="btn ghost" data-act="tests">Back</button></div></div></div>';
}

function figHtml(id, i, opts){
  var p = ph(id); if(!p) return '';
  var l = p.l || '#'; if(l.indexOf('utm_source') < 0) l += (l.indexOf('?') < 0 ? '?' : '&') + 'utm_source=cohasset_language_center&utm_medium=referral';
  return '<figure class="sp-fig' + (opts.sm ? ' sm' : '') + (opts.hi ? ' hi' : '') + '">' + (opts.letter ? '<span class="sp-let">' + letter(i) + '</span>' : '') +
    '<img src="' + esc(p.u) + '" alt="' + esc(p.alt) + '"><figcaption>' + (opts.label ? esc(opts.label) + ' · ' : '') +
    'Photo: <a href="' + esc(l) + '" target="_blank" rel="noopener">' + esc(p.by) + ' / Unsplash</a></figcaption></figure>';
}
function showHtml(sh){
  var h = '';
  if(sh.type === 'q') return '<div class="sp-note" style="border-left-color:var(--line)">The examiner asks:</div><div class="sp-ask">' + esc(sh.text) + '</div>';
  if(sh.type === 'pics'){
    h += '<div class="sp-figs">' + sh.ids.map(function(id, i){ return figHtml(id, i, {sm:true, hi:i === sh.hi, label:sh.labels[i]}); }).join('') + '</div>';
    return h + '<div class="sp-ask">' + esc(sh.text) + '</div>';
  }
  if(sh.type === 'photos'){
    if(sh.head) h += '<div class="sp-part" style="margin-top:6px">' + esc(sh.head) + '</div>';
    h += '<div class="sp-figs">' + sh.ids.map(function(id, i){ return figHtml(id, i, {sm:!!sh.small, letter:sh.ids.length > 1}); }).join('') + '</div>';
    return h + '<div class="sp-ask">' + esc(sh.q) + '</div>';
  }
  if(sh.type === 'options'){
    h += '<div class="sp-ask">' + esc(sh.situation) + '</div><div class="sp-opts">' + sh.options.map(function(o){ return '<span class="sp-opt">' + esc(o) + '</span>'; }).join('') + '</div>';
    return h + (sh.q ? '<div class="sp-ask">' + esc(sh.q) + '</div>' : '');
  }
  if(sh.type === 'mind'){
    return '<div class="sp-mind"><div class="c">' + esc(sh.q) + '</div><div class="ring">' + sh.prompts.map(function(o){ return '<span>' + esc(o) + '</span>'; }).join('') + '</div></div>';
  }
  return '';
}
function renderStep(){
  var st = S.steps[S.idx];
  setView('run'); app.className = 'app';
  app.innerHTML = '<div class="sp-wrap">' + topbar('Cambridge tests &rsaquo; Speaking &rsaquo; ' + esc(S.level) + ' &rsaquo; ' + esc(SP_TESTS[S.level][S.ti].title),
      '<button class="sp-btn2" data-act="finish">Finish &amp; review</button>') +
    '<div class="card"><div class="sp-prog">' + S.steps.map(function(x, i){ return '<i class="' + (i < S.idx ? 'on' : (i === S.idx ? 'cur' : '')) + '"></i>'; }).join('') + '</div>' +
    '<div class="sp-part">' + esc(st.pname) + ' <span class="sp-sub" style="font-weight:400">· ' + (S.idx + 1) + ' / ' + S.steps.length + '</span></div>' +
    '<div class="sp-instr">' + esc(st.instr) + '</div>' + showHtml(st.show) +
    '<div id="spState" class="sp-state"></div><div id="spTimer" class="sp-timer ask">--:--</div>' +
    '<div id="spLive" class="sp-live"></div>' +
    '<div class="sp-actions"><button class="btn ghost" data-act="repeat" id="spRepeat">&#128266; Repeat question</button><button class="btn" data-act="next" id="spNext">Next &rarr;</button></div></div></div>';
  paintLive();
  /* precarga las fotos del paso siguiente */
  var nx = S.steps[S.idx + 1];
  if(nx && nx.show && nx.show.ids) nx.show.ids.forEach(function(id){ var p = ph(id); if(p){ try{ new Image().src = p.u; }catch(e){} } });
}
function setPhase(ph2){
  R.phase = ph2;
  var el = document.getElementById('spState'), tm = document.getElementById('spTimer'), nx = document.getElementById('spNext');
  if(!el) return;
  var last = S.idx === S.steps.length - 1;
  if(nx) nx.innerHTML = (last ? 'Finish' : 'Next') + ' &rarr;';
  if(ph2 === 'ask'){ el.innerHTML = '&#128483; The examiner is speaking…'; tm.className = 'sp-timer ask'; tm.textContent = '--:--'; }
  else if(ph2 === 'prep'){ el.innerHTML = '&#128065; Look at the task — recording starts soon'; tm.className = 'sp-timer'; }
  else if(ph2 === 'rec'){ el.innerHTML = '<span class="sp-dot"></span>Speak now'; tm.className = 'sp-timer'; }
  else if(ph2 === 'done'){ el.innerHTML = '&#10003; Time is up — press Next'; tm.className = 'sp-timer ask'; }
}
function countdown(sec, onzero){
  clearInterval(R.timer); R.deadline = Date.now() + sec * 1000;
  function tick(){
    var left = Math.max(0, Math.ceil((R.deadline - Date.now()) / 1000)), tm = document.getElementById('spTimer');
    if(tm){ tm.textContent = mmss(left); tm.className = 'sp-timer' + (left <= 10 && R.phase === 'rec' ? ' low' : ''); }
    return left > 0;
  }
  tick();
  R.timer = setInterval(function(){ if(!tick()){ clearInterval(R.timer); onzero(); } }, 200);
}

/* ===================== flujo del test ===================== */
function newSession(){
  var t = SP_TESTS[S.level][S.ti];
  S.session = {id:'s' + Date.now(), level:S.level, ti:S.ti, title:t.title, created:Date.now(), n:S.steps.length, feedback:null};
  S.answers = S.steps.map(function(st){ return {part:st.part, task:st.task, prompt:st.prompt, transcript:'', seconds:0, mime:'', blob:null}; });
  putSession(S.session);
}
function startTest(){
  unlockTTS();                                   /* dentro del gesto del click (iOS) */
  S.steps = buildSteps(S.level, SP_TESTS[S.level][S.ti]); S.idx = 0; R.busy = false; R.srDead = false; R.srErr = 0;
  newSession();
  requestMic().then(function(stream){
    R.stream = stream; R.hasMic = !!stream;
    runStep(0);
  });
}
function runStep(i){
  S.idx = i; R.busy = false; var st = S.steps[i];
  clearInterval(R.timer); renderStep(); setPhase('ask');
  speak(st.say, function(){ afterAsk(i); });
}
function afterAsk(i){
  if(S.idx !== i || R.phase !== 'ask') return;
  var st = S.steps[i];
  if(st.prep > 0){ setPhase('prep'); countdown(st.prep, function(){ startRec(i); }); } else startRec(i);
}
function startRec(i){
  if(S.idx !== i) return;
  setPhase('rec'); beginCapture();
  countdown(S.steps[i].secs, function(){
    if(S.idx !== i || R.phase !== 'rec') return;
    stopCapture().then(function(r){ if(S.idx === i){ keepAnswer(i, r); setPhase('done'); } });
  });
}
function keepAnswer(i, r){
  var a = S.answers[i]; a.transcript = r.transcript || ''; a.seconds = r.seconds || 0; a.mime = r.mime || ''; a.blob = r.blob || null;
  persistAnswer(i);
}
function persistAnswer(i){
  var a = S.answers[i], sid = S.session.id;
  putAnswer({key:sid + ':' + (i < 10 ? '0' : '') + i, sid:sid, idx:i, level:S.session.level, test:S.session.ti, part:a.part, task:a.task, prompt:a.prompt,
    transcript:a.transcript, seconds:a.seconds, mime:a.mime, blob:a.blob});
}
function onNext(){
  if(R.busy) return; R.busy = true;
  var i = S.idx; stopSpeech(); clearInterval(R.timer);
  var p;
  if(R.phase === 'rec') p = stopCapture().then(function(r){ keepAnswer(i, r); });
  else { if(R.recording){ R.recording = false; try{ if(R.sr) R.sr.stop(); }catch(e){} } p = Promise.resolve(); }
  p.then(function(){
    if(i + 1 < S.steps.length) runStep(i + 1); else endTest();
  });
}
function onFinishEarly(){
  if(R.busy) return;
  var go = function(){
    R.busy = true; var i = S.idx; stopSpeech(); clearInterval(R.timer);
    var p = R.phase === 'rec' ? stopCapture().then(function(r){ keepAnswer(i, r); }) : Promise.resolve();
    p.then(endTest);
  };
  if(window.NISUI && NISUI.pregunta) NISUI.pregunta('Finish now and go to the review? Questions you have not answered stay empty.', {titulo:'Finish the test?', si:'Finish', no:'Keep going', tono:'info'}).then(function(ok){ if(ok) go(); });
  else if(confirm('Finish now and go to the review?')) go();
}
function endTest(){
  stopSpeech(); clearInterval(R.timer); releaseMic(); R.busy = false;
  S.session.n = S.steps.length; putSession(S.session);
  viewReview();
}

/* ===================== IA (misma logica de token/base que writing-quiz) ===================== */
function aiToken(){
  try{
    var t = localStorage.getItem('bm_token') || localStorage.getItem('cohasset_token'); if(t) return t;
    for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i);
      if(k && k.indexOf('sb-') === 0 && k.indexOf('-auth-token') > 0){ var v = JSON.parse(localStorage.getItem(k) || 'null'); if(v && v.access_token) return v.access_token; } }
  }catch(e){}
  return null;
}
function aiBase(){ return (location.hostname === 'cohasset.pe' || location.hostname === 'www.cohasset.pe') ? '/api' : 'https://cohasset.pe/api'; }
function loginHref(){ return /^nis\./i.test(location.hostname) ? '/' : '/portal'; }
function detailText(j, status){
  var d = j && j.detail;
  if(Array.isArray(d)) d = d.map(function(x){ return (x && (x.msg || x.message)) || (typeof x === 'string' ? x : JSON.stringify(x)); }).join(' · ');
  else if(d && typeof d === 'object') d = d.message || JSON.stringify(d);
  if(d) return String(d);
  if(status === 401) return 'You are not logged in.';
  if(status === 422) return 'Not enough speech to mark: say or type at least 15 words in total.';
  if(status === 429) return 'You have reached your limit of AI evaluations.';
  if(status === 503) return 'The AI examiner is not available right now.';
  return 'The examiner could not answer (' + status + '). Try again in a moment.';
}
function evaluateAI(){
  var box = document.getElementById('spAiResult'), btn = document.getElementById('spAiBtn');
  var list = [];
  S.answers.forEach(function(a){
    var tr = (a.transcript || '').trim(); if(!tr) return;
    list.push({part:a.part, task:String(a.task || '').slice(0, 200), prompt:String(a.prompt || a.task || 'Speaking task').slice(0, 2000),
      transcript:tr.slice(0, 4000), seconds:Math.max(0, a.seconds || 0)});
  });
  var total = list.reduce(function(s, x){ return s + words(x.transcript); }, 0);
  if(total < 15){ box.innerHTML = '<div class="sp-note sp-warn">Say or type at least 15 words in total (now ' + total + ') before asking the AI.</div>'; return; }
  if(list.length > 30) list = list.slice(0, 30);
  btn.disabled = true; box.innerHTML = '<div class="sp-note">&#9203; The AI examiner is reading your answers…</div>';
  fetch(aiBase() + '/cambridge/speaking/feedback', {method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer ' + aiToken()},
    body:JSON.stringify({level:S.session.level, answers:list})})
    .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ return {ok:r.ok, status:r.status, j:j}; }); })
    .then(function(o){
      btn.disabled = false;
      if(!o.ok){ box.innerHTML = '<div class="sp-note sp-warn">' + esc(detailText(o.j, o.status)) + '</div>'; return; }
      S.session.feedback = o.j; S.session.fbAt = Date.now(); putSession(S.session);
      box.innerHTML = feedbackHtml(o.j);
    })
    .catch(function(){ btn.disabled = false; box.innerHTML = '<div class="sp-note sp-warn">Could not reach the examiner. Check your connection and try again.</div>'; });
}
function feedbackHtml(f){
  var marks = f.marks || {}, com = f.comments || {}, keys = SP_LEVEL_CRIT[S.session.level].filter(function(k){ return marks[k] !== undefined; });
  Object.keys(marks).forEach(function(k){ if(keys.indexOf(k) < 0) keys.push(k); });
  var h = '<div class="card" style="border-left:4px solid var(--accent)"><div class="sp-total">' + esc(f.total) + ' / ' + esc(f.max) + '</div>' +
    '<p style="text-align:center;margin:0 0 8px" class="sp-sub">Indicative: the official mark is given by an examiner.</p>' +
    (f.summary ? '<p style="margin:8px 0 12px">' + esc(f.summary) + '</p>' : '');
  keys.forEach(function(k){
    var m = Number(marks[k]) || 0;
    h += '<div class="sp-mark"><div class="r"><b>' + esc(SP_CRIT[k] || k) + '</b><span>' + m + ' / 5</span></div><div class="sp-bar"><i style="width:' + (m * 20) + '%;background:' + (m >= 3 ? '#16a34a' : '#f59e0b') + '"></i></div>' +
      '<div class="sp-sub" style="margin-top:3px">' + esc(com[k] || '') + '</div></div>';
  });
  h += '<div class="sp-note" style="margin-top:14px">Pronunciation and Interactive Communication are not marked here: text cannot show how you sound, and interaction needs a real partner. These are tips only.</div>';
  h += '<div class="sp-mark"><b>Pronunciation</b> <span class="sp-sub">(tip, not marked)</span><div class="sp-sub" style="margin-top:3px">' + esc(com.Pronunciation || '') + '</div></div>';
  h += '<div class="sp-mark"><b>Interactive Communication</b> <span class="sp-sub">(tip, not marked)</span><div class="sp-sub" style="margin-top:3px">' + esc(com.Interaction || '') + '</div></div>';
  if((f.fixes || []).length){
    h += '<div style="margin-top:12px"><b>Things to fix</b>' + f.fixes.map(function(x){
      return '<div style="margin:6px 0;font-size:.92rem"><s style="color:#b91c1c">' + esc(x.quote) + '</s> &rarr; <b style="color:#15803d">' + esc(x.better) + '</b><div class="sp-sub">' + esc(x.why) + '</div></div>';
    }).join('') + '</div>';
  }
  if(f.remaining !== undefined && f.remaining !== null) h += '<p class="sp-sub" style="margin:10px 0 0">AI evaluations remaining: ' + esc(f.remaining) + '</p>';
  return h + '</div>';
}
function selfCheckHtml(){
  var lvl = S.session.level, keys = SP_LEVEL_CRIT[lvl], tbl = SP_SELF[lvl];
  var h = '<div class="card sp-self"><h2>Self-check</h2><p class="sp-sub" style="margin:0 0 6px">Listen to your recording and tick what you did. These are short summaries of the public Cambridge descriptors.</p>';
  keys.forEach(function(k){
    h += '<details open style="margin:8px 0"><summary><b>' + esc(SP_CRIT[k]) + '</b></summary>' +
      '<label><input type="checkbox"> ' + esc(tbl[k][0]) + '</label><label><input type="checkbox"> ' + esc(tbl[k][1]) + '</label></details>';
  });
  h += '<details style="margin:8px 0"><summary><b>Pronunciation</b> <span class="sp-sub">(not marked here)</span></summary><label><input type="checkbox"> ' + esc(SP_SELF_OTHER.Pronunciation) + '</label></details>';
  h += '<details style="margin:8px 0"><summary><b>Interactive Communication</b> <span class="sp-sub">(not marked here)</span></summary><label><input type="checkbox"> ' + esc(SP_SELF_OTHER.Interaction) + '</label></details></div>';
  return h;
}

/* ===================== revision ===================== */
var urls = [];
function freeUrls(){ urls.forEach(function(u){ try{ URL.revokeObjectURL(u); }catch(e){} }); urls = []; }
function viewReview(){
  setView('review'); app.className = 'app'; freeUrls();
  var ss = S.session, lv = SP_LEVELS[ss.level], tok = aiToken();
  var h = '<div class="sp-wrap">' + topbar('Cambridge tests &rsaquo; Speaking &rsaquo; ' + esc(ss.level) + ' &rsaquo; ' + esc(ss.title) + ' &rsaquo; Review') +
    '<h1 style="margin:0 0 4px;font-size:1.5rem">Review — ' + esc(lv.exam) + ' · ' + esc(ss.title) + '</h1>' +
    '<p class="sp-sub" style="margin:0 0 10px">' + new Date(ss.created).toLocaleString() + ' · saved on this device</p>';
  h += '<div class="card"><h2>AI examiner</h2>';
  if(tok) h += '<p class="sp-sub" style="margin:0 0 8px">The AI reads your transcripts (correct them below first) and marks ' + esc(SP_LEVEL_CRIT[ss.level].map(function(k){ return SP_CRIT[k]; }).join(', ')) + '.</p>' +
    '<button class="btn" id="spAiBtn" data-act="ai">Evaluate with AI</button>';
  else h += '<p class="sp-sub" style="margin:0 0 8px">The AI evaluation is only for logged-in students. <a class="link" href="' + esc(loginHref()) + '">Log in to ' + esc(MSITE.portalName) + '</a> and come back to this page.</p>' +
    '<button class="btn" id="spAiBtn" disabled>Evaluate with AI</button>';
  h += '<div id="spAiResult" style="margin-top:12px">' + (ss.feedback ? feedbackHtml(ss.feedback) : '') + '</div></div>';
  h += selfCheckHtml();
  h += '<div class="card"><h2>Your answers</h2>';
  S.answers.forEach(function(a, i){
    var src = '';
    if(a.blob){ try{ var u = URL.createObjectURL(a.blob); urls.push(u); src = u; }catch(e){} }
    h += '<div class="sp-ans"><div class="h"><span>' + esc(a.task) + '</span><span>' + (a.seconds || 0) + ' s · <span id="spWc' + i + '">' + words(a.transcript) + '</span> words</span></div>' +
      '<div class="q">' + esc((S.steps[i] && S.steps[i].say) || a.prompt) + '</div>' +
      (src ? '<audio controls preload="none" src="' + esc(src) + '"></audio>' : '<div class="sp-sub">No recording for this answer.</div>') +
      '<textarea data-i="' + i + '" placeholder="Transcript — type or correct what you said">' + esc(a.transcript) + '</textarea></div>';
  });
  h += '</div><div class="row"><button class="btn" data-act="tests">Another test</button><button class="btn ghost" data-act="history">My sessions</button><button class="btn ghost" data-act="home">Change level</button></div></div>';
  app.innerHTML = h;
}
var saveT = null;
function onTranscriptInput(ta){
  var i = Number(ta.getAttribute('data-i')); if(!S.answers[i]) return;
  S.answers[i].transcript = ta.value;
  var w = document.getElementById('spWc' + i); if(w) w.textContent = words(ta.value);
  clearTimeout(saveT); saveT = setTimeout(flushSaves, 500); pending = true;
}
var pending = false;
function flushSaves(){
  clearTimeout(saveT);
  if(!pending || !S.session) return;
  pending = false;
  S.answers.forEach(function(a, i){ persistAnswer(i); });
}

/* ===================== historial ===================== */
function viewHistory(){
  setView('history'); app.className = 'app';
  app.innerHTML = '<div class="sp-wrap">' + topbar('Cambridge tests &rsaquo; Speaking &rsaquo; My sessions') + '<div id="spHist"><p class="sp-sub">Loading…</p></div>' +
    '<p style="margin-top:14px"><a class="link" href="#" data-act="home">&larr; Back to levels</a></p></div>';
  allSessions().then(function(list){
    list.sort(function(a, b){ return b.created - a.created; }); S.history = list;
    var el = document.getElementById('spHist'); if(!el) return;
    el.innerHTML = list.length ? list.map(function(s){
      var fb = s.feedback ? ' · AI: <b>' + esc(s.feedback.total) + ' / ' + esc(s.feedback.max) + '</b>' : '';
      return '<div class="sp-hist"><div class="t"><b>' + esc(s.level) + ' · ' + esc(s.title) + '</b><div class="sp-sub">' + new Date(s.created).toLocaleString() + fb + '</div></div>' +
        '<button class="btn ghost" data-act="open" data-id="' + esc(s.id) + '">Open</button><button class="sp-btn2" data-act="del" data-id="' + esc(s.id) + '">Delete</button></div>';
    }).join('') : '<div class="sp-note">No sessions yet. Do a test and it will appear here.</div>';
  });
}
function openSession(id){
  var s = null; S.history.forEach(function(x){ if(x.id === id) s = x; }); if(!s) return;
  answersOf(id).then(function(list){
    list.sort(function(a, b){ return a.idx - b.idx; });
    S.level = s.level; S.ti = s.ti; S.session = s;
    S.steps = buildSteps(s.level, SP_TESTS[s.level][s.ti]);
    S.answers = S.steps.map(function(st, i){
      var a = null; list.forEach(function(x){ if(x.idx === i) a = x; });
      return a ? {part:a.part, task:a.task, prompt:a.prompt, transcript:a.transcript || '', seconds:a.seconds || 0, mime:a.mime || '', blob:a.blob || null}
               : {part:st.part, task:st.task, prompt:st.prompt, transcript:'', seconds:0, mime:'', blob:null};
    });
    viewReview();
  });
}
function askDelete(id){
  var go = function(){ deleteSession(id).then(viewHistory); };
  if(window.NISUI && NISUI.pregunta) NISUI.pregunta('Delete this session, its recordings and its feedback from this device?', {titulo:'Delete session?', si:'Delete', no:'Cancel', tono:'mal', peligro:true}).then(function(ok){ if(ok) go(); });
  else if(confirm('Delete this session and its recordings?')) go();
}

/* ===================== eventos ===================== */
app.addEventListener('click', function(e){
  var t = e.target; while(t && t !== app && !(t.getAttribute && t.getAttribute('data-act'))) t = t.parentNode;
  if(!t || t === app) return;
  var act = t.getAttribute('data-act');
  if(act !== 'repeat') flushSaves();
  if(act === 'level'){ S.level = t.getAttribute('data-l'); viewTests(); }
  else if(act === 'home'){ e.preventDefault(); freeUrls(); viewHome(); }
  else if(act === 'tests'){ freeUrls(); if(S.level) viewTests(); else viewHome(); }
  else if(act === 'test'){ S.ti = Number(t.getAttribute('data-i')); viewPrepare(); }
  else if(act === 'start'){ startTest(); }
  else if(act === 'next'){ onNext(); }
  else if(act === 'repeat'){ if(R.phase === 'ask' || R.phase === 'prep' || R.phase === 'rec' || R.phase === 'done'){ if(R.phase === 'ask'){ speak(S.steps[S.idx].say, function(){ afterAsk(S.idx); }); } else { var tk = ++R.tok; try{ speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(S.steps[S.idx].say); u.lang = 'en-GB'; var v = pickVoice(); if(v) u.voice = v; u.rate = 0.92; R.u = u; speechSynthesis.speak(u); }catch(x){} } } }
  else if(act === 'finish'){ onFinishEarly(); }
  else if(act === 'ai'){ evaluateAI(); }
  else if(act === 'history'){ freeUrls(); viewHistory(); }
  else if(act === 'open'){ openSession(t.getAttribute('data-id')); }
  else if(act === 'del'){ askDelete(t.getAttribute('data-id')); }
});
app.addEventListener('input', function(e){ if(e.target && e.target.tagName === 'TEXTAREA' && e.target.getAttribute('data-i') !== null) onTranscriptInput(e.target); });
try{ if(window.speechSynthesis) speechSynthesis.onvoiceschanged = function(){}; }catch(e){}
window.addEventListener('beforeunload', function(){ try{ flushSaves(); releaseMic(); stopSpeech(); }catch(e){} });

viewHome();
})();
