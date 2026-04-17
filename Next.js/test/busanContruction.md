\-- test.busan\_construction definition



\-- Drop table



\-- DROP TABLE test.busan\_construction;



CREATE TABLE test.busan\_construction (

&#x09;gid serial4 NOT NULL,

&#x09;seq\_no int8 NULL,

&#x09;project\_name text NULL,

&#x09;d\_day int8 NULL,

&#x09;total\_days int8 NULL,

&#x09;elapsed\_days int8 NULL,

&#x09;progress\_rate numeric NULL,

&#x09;plan\_rate numeric NULL,

&#x09;achievement\_rate numeric NULL,

&#x09;field\_code varchar(10) NULL,

&#x09;location\_text text NULL,

&#x09;start\_date date NULL,

&#x09;end\_date date NULL,

&#x09;summary text NULL,

&#x09;dept\_code varchar(10) NULL,

&#x09;contact text NULL,

&#x09;budget\_text text NULL,

&#x09;lat numeric NULL,

&#x09;lon numeric NULL,

&#x09;geom public.geometry(point, 4326) NULL,

&#x09;CONSTRAINT busan\_construction\_pkey PRIMARY KEY (gid)

);

CREATE INDEX busan\_construction\_geom\_idx ON test.busan\_construction USING gist (geom);

-- test.busan\_construction\_raw definition



\-- Drop table



\-- DROP TABLE test.busan\_construction\_raw;



CREATE TABLE test.busan\_construction\_raw (

&#x09;fid int8 NULL,

&#x09;seq\_no int8 NULL,

&#x09;construction\_name text NULL,

&#x09;d\_day int8 NULL,

&#x09;total\_days int8 NULL,

&#x09;elapsed\_days int8 NULL,

&#x09;progress\_rate numeric NULL,

&#x09;plan\_rate numeric NULL,

&#x09;achievement\_rate numeric NULL,

&#x09;field\_code varchar(10) NULL,

&#x09;location\_text text NULL,

&#x09;start\_date date NULL,

&#x09;end\_date date NULL,

&#x09;summary text NULL,

&#x09;dept\_code varchar(10) NULL,

&#x09;contact text NULL,

&#x09;budget\_text text NULL,

&#x09;lat numeric NULL,

&#x09;lon numeric NULL

);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(1, 1, '산성터널 접속도로(금샘로) 개설공사(용역)', 1842, 10226, 12068, 100, 100, 75, 'F01', '금강식물원\~부산대학교\~구서롯데캐슬 APT일원', '1993-01-01', '2020-12-31', '도로개설 L=3,550m, B=20m(4차로)rn', 'B01', '051-888-6202', '1,054억원', 35.23088107, 129.0931955, 'SRID=4326;POINT (129.0931955 35.23088107)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(2, 2, '전포로\~하마정간 도로확장공사', 4278, 7425, 11703, 100, 100, 100, 'F01', '부산진구 전포로\~하마정간', '1994-01-01', '2014-05-01', '확장L=1.54km, 광장조성 A=34,740㎡', 'B01', NULL, '1850억원', 35.16765367, 129.0665958, 'SRID=4326;POINT (129.0665958 35.16765367)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(3, 3, '덕천(화명)\~양산간 도로건설', 2665, 6481, 9146, 100, 100, 100, 'F01', '북구 덕천(화명)동 ～ 양산시 경계', '2001-01-01', '2018-09-30', 'L=6.8km, B=18\~38m(4\~8차로)', 'B01', '051-888-6414', '2301억원', 35.19729594, 128.9900366, 'SRID=4326;POINT (128.9900366 35.19729594)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(4, 4, '명지지구 진입도로\[지하차도] 개설 공사', 3406, 5316, 8722, 100, 100, 100, 'F01', '명지', '2002-03-01', '2016-09-19', '지하차도 L=0.6㎞ B=21m, 교량 L=0.06㎞ B=38m', 'B01', '051-888-6424', '409', 35.21219795, 128.9805706, 'SRID=4326;POINT (128.9805706 35.21219795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(5, 5, '개금 건널목 지하차도 설치 ☞공사준공', 6621, 1795, 8416, 100, 100, 100, 'F01', '부산진구 개금동 개금건널목 일원', '2003-01-01', '2007-12-01', 'L=361m, B=20～28m(지하차도 179m)', 'B01', '051-888-6224', '261', 35.1559254, 129.0295401, 'SRID=4326;POINT (129.0295401 35.1559254)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(6, 6, '가덕대교 건설사업', 5555, 2861, 8416, 100, 100, 100, 'F01', NULL, '2003-01-01', '2010-11-01', '교량건설 L=1,120m, B=21∼35m', 'B01', NULL, '1,340억원', 35.08783426, 128.8432847, 'SRID=4326;POINT (128.8432847 35.08783426)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(7, 7, '을숙도대교 건설사업(☞공사준공)', 5890, 1795, 7685, 100, 100, 100, 'F01', '사하구 신평동(을숙도대교) \~ 구평동(장림고개)', '2005-01-01', '2009-12-01', 'L=5,2㎞, B=25.5～35m(6차로)', 'B01', '051-888-6156,051-888-6155', '4200', 35.1044479, 128.974933, 'SRID=4326;POINT (128.974933 35.1044479)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(8, 8, '생곡쓰레기매립장(2단계) 조성', 3669, 3804, 7473, 100, 100, 100, 'F04', '강서구 생곡동 산61-1번지 일원', '2005-08-01', '2015-12-31', '조성면적 69,970㎡, 쓰레기매립·복토4,939천㎥', 'B02', '051-888-6255', '430', 35.13049744, 128.8725201, 'SRID=4326;POINT (128.8725201 35.13049744)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(9, 9, '하수관거신설(확충)공사\[남부처리구역(전포분구)]', 5951, 1369, 7320, 100, 100, 100, 'F03', NULL, '2006-01-01', '2009-10-01', '오수관로 D=250\~500mm L=18.788m', 'B02', NULL, '168', 35.16285537, 129.0531698, 'SRID=4326;POINT (129.0531698 35.16285537)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(10, 10, '산성터널 접속도로(화명측) 건설', 2604, 4657, 7261, 100, 100, 100, 'F01', '화명현대아파트 일원', '2006-03-01', '2018-11-30', 'L=1.68㎞, B=17.9\~50m(4\~6차로)', 'B01', '051-888-6411', '1,611억원', 35.23532956, 129.0202258, 'SRID=4326;POINT (129.0202258 35.23532956)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(11, 11, '산성터널 접속도로(금정측) 건설', 2106, 4849, 6955, 100, 100, 100, 'F01', '금정구 장전동 장전초교\~회동동 회동I.C', '2007-01-01', '2020-04-11', 'L=3,240m, B=4\~6차로', 'B01', '051-888-6202,051-888-6204,051-888-6205', '3,308억원', 35.23930999, 129.0924895, 'SRID=4326;POINT (129.0924895 35.23930999)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(12, 12, '부산항대교(북항대교) 민간투자사업', 4279, 2586, 6865, 100, 100, 100, 'F01', '영도구 청학동 ～ 남구 감만동', '2007-04-01', '2014-04-30', 'L=3.331㎞  B=18.6\~28.7m(4～6차로)', 'B01', '051-888-6203', '5384', 35.1106216, 129.0864296, 'SRID=4326;POINT (129.0864296 35.1106216)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(13, 13, '하수관거신설(확충)공사\[기장처리구역(송정분구)]', 5920, 670, 6590, 100, 100, 100, 'F03', '해운대구 송정동 일원', '2008-01-01', '2009-11-01', '하수관거 L=552m, D=250\~400mm', 'B02', NULL, '18.61억원', 35.18953929, 129.1808293, 'SRID=4326;POINT (129.1808293 35.18953929)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(14, 14, '감천항\~다대포항 연결도로 건설공사', 3669, 2921, 6590, 100, 100, 100, 'F01', '사하구 다대동 국제여객길 \~ 구평동 감천항만로', '2008-01-01', '2015-12-31', '도로개설rnL=1.48㎞ B=20m(4차로)', 'B01', '888-6206', '230', 35.05611311, 128.9913822, 'SRID=4326;POINT (128.9913822 35.05611311)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(15, 15, '정관산업단지 연결도로 \[예림교차로\~농공단지] 확장', 565, 6025, 6590, 100, 100, 100, 'F01', '기장군 정관농공단지\~국지도60호선 예림교차로', '2008-01-01', '2024-06-30', '도로확장 및 개설 L=1,710m, B=25m(4차로)', 'B01', '888-6425', '193.6억원', 35.32779024, 129.1877925, 'SRID=4326;POINT (129.1877925 35.32779024)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(16, 16, '장안\~임랑간(국지도 60호선) 연결도로 건설', 2999, 3591, 6590, 100, 100, 100, 'F01', '기장군 장안교차로(국도14호선) \~ 임랑교차로(국도31호선)', '2008-01-01', '2017-10-31', '도로건설 L=2.5㎞ B=20\~25m(4차로)', 'B01', '051-888-6187,051-888-6184', '654억원', 35.31287636, 129.2453049, 'SRID=4326;POINT (129.2453049 35.31287636)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(17, 17, '시립노인 전문병원 건립공사☞공사완료', 4399, 2191, 6590, 100, 100, 100, 'F05', '사하구 하단동 566-3번지 일원', '2008-01-01', '2013-12-31', '지하2층, 지상 2층, 연면적 6,924㎡', 'B03', NULL, '91', 35.10223224, 128.9628742, 'SRID=4326;POINT (128.9628742 35.10223224)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(18, 18, '북항대교\~동명오거리간 고가.지하차도 건설', 3303, 3287, 6590, 100, 100, 100, 'F01', '남두 감만동(시선대부두)\~대연동(대연고가교)', '2008-01-01', '2016-12-31', '도로개설 L=3,040m, B=4\~8차로', 'B01', '051-888-6155,051-888-6157', '2,193억원', 35.13652979, 129.0842428, 'SRID=4326;POINT (129.0842428 35.13652979)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(19, 19, '석대천(하류)생태하천 조성', 4063, 2436, 6499, 100, 100, 100, 'F06', NULL, '2008-04-01', '2014-12-02', '하천정비 L=4.94km', 'B02', NULL, '148', 35.16308836, 129.1635923, 'SRID=4326;POINT (129.1635923 35.16308836)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(20, 20, '석대천(상류) 하천정비공사', 3303, 2921, 6224, 100, 100, 100, 'F06', '석대천', '2009-01-01', '2016-12-31', '하천정비 L=2.5(발주 1.97)km', 'B02', '051-888-6224', '166억원', 35.23514214, 129.1704955, 'SRID=4326;POINT (129.1704955 35.23514214)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(21, 21, '수영하수처리시설 시설개선사업', 4764, 1429, 6193, 100, 100, 100, 'F03', '동래구 온천 천남로 185', '2009-02-01', '2012-12-31', '부지집약화 시설, 고도처리개선, 동부이송관거', 'B02', '051-888-4093', '1074', 35.18862952, 129.1111671, 'SRID=4326;POINT (129.1111671 35.18862952)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(22, 22, 'UN평화기념관 건립공사', 4125, 1734, 5859, 100, 100, 100, 'F05', '남구 대연동 당곡공원 내', '2010-01-01', '2014-10-01', '지하2/지상3층, 8,000㎡', 'B03', NULL, '258억원', 35.1274541, 129.0958974, 'SRID=4326;POINT (129.0958974 35.1274541)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(23, 23, '구포대교\~대동수문간 도로확장공사', 3213, 2646, 5859, 100, 100, 100, 'F01', '강서구 구포대교 \~ 김해시 대동면(대동수문)', '2010-01-01', '2017-03-31', '도로확장공사rnL=2.9km, B=8m → 30m(2차로→6차로)', 'B01', '051-888-6206', '842억원', 35.2139649, 128.9880057, 'SRID=4326;POINT (128.9880057 35.2139649)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(24, 24, '괴정천 생태하천 조성공사', 2969, 2890, 5859, 100, 100, 100, 'F06', '사하구 괴정천 일원', '2010-01-01', '2017-11-30', '하천정비 L=671.2m, 교량재가설 L=92.2m', 'B02', '051-888-6224', '275억원', 35.10504089, 128.960836, 'SRID=4326;POINT (128.960836 35.10504089)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(25, 25, '학장천 고향의 강 조성사업(2단계)', 2514, 3345, 5859, 100, 100, 100, 'F06', '사상구 주례동 주학교 \~ 낙동강 합류부', '2010-01-01', '2019-02-28', '하천정비 L=3,150m', 'B02', '051-888-6231', '382.6억원', 35.14243529, 128.9865715, 'SRID=4326;POINT (128.9865715 35.14243529)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(26, 26, '동삼혁신지구 친수호안 조성공사', 4339, 1461, 5800, 100, 100, 100, 'F06', '영도구 동삼혁신지구 전면해안', '2010-03-01', '2014-03-01', '친수호안 L=771m', 'B02', NULL, '264', 35.09123989, 129.0678888, 'SRID=4326;POINT (129.0678888 35.09123989)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(27, 27, '해포분교 해양레포츠스쿨 조성☞공사준공 완료', 4764, 1036, 5800, 100, 100, 100, 'F05', '강서구 봉림동 738-1714 외', '2010-03-01', '2012-12-31', '부지면적 9,045㎡, 연면적2,561.79㎡ 지상1층 증축', 'B03', NULL, '19', 35.21219795, 128.9805706, 'SRID=4326;POINT (128.9805706 35.21219795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(28, 28, '부산남항 남항동 호안정비공사', 4520, 1219, 5739, 100, 100, 100, 'F06', '영도구 남항동 방파호안 전면수역', '2010-05-01', '2013-09-01', '호안정비 L=854m', 'B02', NULL, '183', 35.08540798, 129.0376363, 'SRID=4326;POINT (129.0376363 35.08540798)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(29, 29, '사하구 강변도로 확장', 2938, 2788, 5726, 100, 100, 100, 'F01', '사하구 시평동 66호광장 다대동 (주)대아선재', '2010-05-14', '2017-12-31', '도로확장 L=3,800m,B=25→31m,도로정비L=400m,B=30m', 'B01', '051-888-6417', '336억원', 35.07960834, 128.950843, 'SRID=4326;POINT (128.950843 35.07960834)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(30, 30, '하수관거신설(확충)공사\[장림처리구역(만덕분구)]', 4064, 1644, 5708, 100, 100, 100, 'F03', '부산광역시 북구 만덕 1,2,3동 일원', '2010-06-01', '2014-12-01', '하수관거(D=150\~500㎜), L=13.117㎞', 'B02', NULL, '144', 35.20975429, 129.0320871, 'SRID=4326;POINT (129.0320871 35.20975429)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(31, 31, '하수관거신설확충\[장림처리구역(대리천일원)]', 3469, 2239, 5708, 100, 100, 100, 'F03', '부산광역시 북구 구포동 일원', '2010-06-01', '2016-07-18', '하수관거(D=80\~300㎜), L=20.265㎞', 'B02', '888-6257', '177.55', 35.19729594, 128.9900366, 'SRID=4326;POINT (128.9900366 35.19729594)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(32, 32, '하수관거신설(확충)공사\[남부처리구역(가야처리분구일원)]', 3244, 2464, 5708, 100, 100, 100, 'F07', '부산광역시 부산진구 가야동, 개금동일원', '2010-06-01', '2017-02-28', '하수관거(D50\~500mm) L=11.817kmrn배수설비 N = 2,284개소', 'B02', '051-888-6236', '18,593백만원', 35.1525726, 129.0317172, 'SRID=4326;POINT (129.0317172 35.1525726)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(33, 33, '하수슬러지 육상처리시설', 4916, 731, 5647, 100, 100, 100, 'F05', '강서구 생곡동 135-94번지 일원', '2010-08-01', '2012-08-01', '육상처리시설 550톤/일', 'B03', NULL, '750억원', 35.12815166, 128.8751709, 'SRID=4326;POINT (128.8751709 35.12815166)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(34, 34, '생활폐기물 연료화 및 전용보일러 설치사업', 4673, 913, 5586, 100, 100, 100, 'F05', '강서구 생곡동', '2010-10-01', '2013-04-01', '부지면적 98,000㎡, 연면적 30,501㎡', 'B03', NULL, '1806억원', 35.13414803, 128.8882972, 'SRID=4326;POINT (128.8882972 35.13414803)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(35, 35, '용호만 유람선 터미널 조성공사☞공사완료', 4673, 913, 5586, 100, 100, 100, 'F05', '-', '2010-10-01', '2013-04-01', '유람선 터미널 조성공사(지상3층, 연면적 1,903㎡)', 'B03', '051-888-6235', '59', 35.18004449, 129.0750317, 'SRID=4326;POINT (129.0750317 35.18004449)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(36, 36, '녹산통합오수관로 설치 공사', 4612, 943, 5555, 100, 100, 100, 'F03', '강서구 녹산동 일원', '2010-11-01', '2013-06-01', '통합오수관로(D=500\~1,350mm) L=12.156㎞', 'B02', NULL, '448억원', 35.1246672, 128.8603486, 'SRID=4326;POINT (128.8603486 35.1246672)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(37, 37, '부산항대교 영도연결도로 건설공사', 3852, 1673, 5525, 100, 100, 100, 'F01', '영도구 영선동\~청학동', '2010-12-01', '2015-07-01', 'L=2.44km, B=19\~60m(4\~6차로)', 'B01', NULL, '3,137억원', 35.09671175, 129.0598473, 'SRID=4326;POINT (129.0598473 35.09671175)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(38, 38, '부산항대교\~동명오거리간 고가·지하차도건설', 3303, 2195, 5498, 100, 100, 100, 'F01', '부산광역시 남구 동명오거리', '2010-12-28', '2016-12-31', 'L=3.04km,   B=18.6\~41.5m(4\~8차로)', 'B01', '051-888-6155', '2193억원', 35.12108066, 129.0986296, 'SRID=4326;POINT (129.0986296 35.12108066)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(39, 39, '반송로(동천교\~석대쓰레기매립장)확장공사', 1112, 4382, 5494, 100, 100, 100, 'F01', '금정구 금사동 동천교 \~ 해운대구 석대쓰레기 매립장', '2011-01-01', '2022-12-31', '도로확장 L=930m, B=25->29\~35m(4\~6차로)', 'B01', '051-888-6201', '17,900백만원', 35.22032268, 129.1199384, 'SRID=4326;POINT (129.1199384 35.22032268)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(40, 40, '학리항 정비공사', 4125, 1369, 5494, 100, 100, 100, 'F06', NULL, '2011-01-01', '2014-10-01', '방파제설치 L=70m', 'B02', NULL, '64', 35.25766125, 129.247955, 'SRID=4326;POINT (129.247955 35.25766125)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(41, 41, '금성동 오수관로 설치공사', 3616, 1878, 5494, 100, 100, 100, 'F03', '금정구 금성동\~북구 화명동 일원', '2011-01-01', '2016-02-22', '오수관로 설치 L=4.3㎞(D=250\~300mm)', 'B02', '051-888-6236', '44.8억원', 35.24277705, 129.0921041, 'SRID=4326;POINT (129.0921041 35.24277705)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(42, 42, '금정시내버스 공영 차고지 조성사업', 3700, 1794, 5494, 100, 100, 100, 'F02', '금정구 노포동 227번지 일원', '2011-01-01', '2015-11-30', '차고지조성 A=28,399㎡', 'B02', '051-888-6253', '210', 35.28955424, 129.0989259, 'SRID=4326;POINT (129.0989259 35.28955424)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(43, 43, '명례일반산업단지 진입도로 건설공사', 4155, 1249, 5404, 100, 100, 100, 'F01', '기장군 장안읍 기룡리\~명례리', '2011-04-01', '2014-09-01', 'L=2.44km B=18.5→35m(4→6차로)', 'B01', NULL, '254', 35.36302968, 129.2627978, 'SRID=4326;POINT (129.2627978 35.36302968)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(44, 44, '명례일반산업단지 폐수종말처리시설 건설', 4429, 975, 5404, 100, 100, 100, 'F03', '기장군 장안면 명례산단 내', '2011-04-01', '2013-12-01', '1단계(처리용량 Q=1,600톤/일)', 'B02', NULL, '90', 35.36982302, 129.2647697, 'SRID=4326;POINT (129.2647697 35.36982302)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(45, 45, '사상 광장로 녹화사업', 4732, 642, 5374, 100, 100, 100, 'F06', '사상구 괘법동 광장로(괘법교\~애플아울렛)', '2011-05-01', '2013-02-01', 'L=0.7km, B=30m', 'B02', NULL, '45억원', 35.16396007, 128.9785791, 'SRID=4326;POINT (128.9785791 35.16396007)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(46, 46, '부산 미디어아트벙커 조성', 4429, 914, 5343, 100, 100, 100, 'F05', '수영구 광안동 산63-2', '2011-06-01', '2013-12-01', '지하1층, 연면적 3,693㎡', 'B03', NULL, '27', 35.14921263, 129.1060227, 'SRID=4326;POINT (129.1060227 35.14921263)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(47, 47, '센텀 119안전센터 신축공사', 4612, 670, 5282, 100, 100, 100, 'F05', '해운대구 우동 1481번지', '2011-08-01', '2013-06-01', '지상3층, 연면적 1,500㎡', 'B03', NULL, '32', 35.17336235, 129.1308125, 'SRID=4326;POINT (129.1308125 35.17336235)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(48, 48, '덕천천 생태하천 정비사업', 4125, 1096, 5221, 100, 100, 100, 'F06', '북구 만덕동\~구포동 일원', '2011-10-01', '2014-10-01', '진입도로L=550m, 접근교량 L=290m', 'B02', NULL, '126억원', 35.21020056, 129.0031545, 'SRID=4326;POINT (129.0031545 35.21020056)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(49, 49, '구포대교\~대동수문간 도로확장공사(2공구)', 3244, 1965, 5209, 100, 100, 100, 'F01', '강서구 구포대교 \~ 김해시 대동면(대동수문)', '2011-10-13', '2017-02-28', '도로확장공사rnL=2.72km, B=8m → 30m', 'B01', '051-888-6206', '23,619백만원', 35.21437783, 128.9881037, 'SRID=4326;POINT (128.9881037 35.21437783)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(50, 50, '하수관거 신설(확충)공사\[남부처리구역(광안동일원)]', 2787, 2373, 5160, 100, 100, 100, 'F03', '수영구 광안동 일원', '2011-12-01', '2018-05-31', '관거(D=200～450mm) L=18.056㎞, 배수설비 2,817가구', 'B02', '051-888-6259', '299억원', 35.14553823, 129.113134, 'SRID=4326;POINT (129.113134 35.14553823)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(51, 51, '해운대수목원 조성사업', 1445, 6585, 5140, 83, 83, 100, 'F06', '해운대구 석대동 24번지 일원', '2011-12-21', '2029-12-31', 'A=633,671㎡ rn0 1단계 : 부분 준공(2011. 12월 \~ 2017. 5월) 및 임시개장(2021. 5월), 치유의 숲 지구, A = 414,864㎡rn0 2단계 : 공사 진행 중(2016. 12월 \~ 2029. 12월, 예정), 도시생활 숲 지구,  A =218,807㎡', 'B02', '051-888-6295', '1,213억원(공사 660, 보상 489, 기타 64)', 35.23031372, 129.1318839, 'SRID=4326;POINT (129.1318839 35.23031372)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(52, 52, '다사랑 복합문화예술회관 건립☞공사완료', 3975, 1154, 5129, 100, 100, 100, 'F05', '부산진구 대학로 62 일원', '2012-01-01', '2015-02-28', '부지 2,358㎡, 1개동, 연면적 4,043㎡', 'B03', '051-550-4580', '103', 35.15122907, 129.0344487, 'SRID=4326;POINT (129.0344487 35.15122907)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(53, 53, '하수처리장 노후기자재 교체 및 시설보강☞공사완료', 4673, 456, 5129, 100, 100, 100, 'F03', '남구 용호동 남부하수처리장 등', '2012-01-01', '2013-04-01', '농축기교체, 하수찌꺼기 호퍼증설 등', 'B03', NULL, '6', 35.11704069, 129.1153719, 'SRID=4326;POINT (129.1153719 35.11704069)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(54, 54, '장애인종합회관 확보사업☞공사완료', 4613, 516, 5129, 100, 100, 100, 'F05', '동구 초량동 1203-2', '2012-01-01', '2013-05-31', '연면적 4,965㎡', 'B03', '051-888-4333', '7', 35.1142837, 129.0407241, 'SRID=4326;POINT (129.0407241 35.1142837)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(55, 55, '구덕민속예술관 리모델링 및 증축☞공사완료', 4035, 1094, 5129, 100, 100, 100, 'F05', '동서구 서대신동3가 산2-3번지 일원', '2012-01-01', '2014-12-30', '부지 2,611㎡, 연면적 693.21㎡', 'B03', NULL, '7', 35.11231237, 129.0120291, 'SRID=4326;POINT (129.0120291 35.11231237)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(56, 56, '검역계류장 이전사업 진입도로', 3791, 1338, 5129, 100, 100, 100, 'F01', '부산광역시 강서구 지사동 산133-1번지 일원', '2012-01-01', '2015-08-31', '농림축산검역본부 영남지역본부 검역계류장rn이전부지 진입도로 건설rn진입도로 L=350m(교량 76m, 도로 274m), B=12m', 'B01', '051-888-6411', '46', 35.14431721, 128.8113354, 'SRID=4326;POINT (128.8113354 35.14431721)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(57, 57, '수영강 하류 생태하천 복원(3차)', 3318, 1811, 5129, 100, 100, 100, 'F06', '금정구 회동수원지(댐) 방류구 \~ 동천교', '2012-01-01', '2016-12-16', '생태하천 복원 및 친수공간 시민생활 환경개선rn하천정비 L=2.8km, B=50\~140m', 'B02', '051-888-6227', '14.7억원', 35.22641602, 129.1208744, 'SRID=4326;POINT (129.1208744 35.22641602)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(58, 58, '금강공원 재정비 사업', 1080, 6209, 5129, 1, 1, 100, 'F05', '부산시 동래구 온천동 금강공원일원', '2012-01-01', '2028-12-31', 'A=400,000㎡', 'B02', '051-888-6291', '1,891억원', 35.22148827, 129.0724187, 'SRID=4326;POINT (129.0724187 35.22148827)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(59, 59, '부산박물관 수장고 건립사업☞공사완료', 3944, 1125, 5069, 100, 100, 100, 'F05', '남구 유엔평화로 63 부산박물관', '2012-03-01', '2015-03-31', '지하1, 지상2, 연면적 3,127㎡', 'B03', '888-6310', '96', 35.12952167, 129.0941075, 'SRID=4326;POINT (129.0941075 35.12952167)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(60, 60, '감전유수지 다기능 저류시설 설치', 2969, 2039, 5008, 100, 100, 100, 'F03', '사상구 괘법동 감전유수지 일원', '2012-05-01', '2017-11-30', '저류시설 V=17,400㎥ 도수로 L=1,321m 등', 'B02', '051-888-6232', '290억원', 35.16275491, 128.9762234, 'SRID=4326;POINT (128.9762234 35.16275491)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(61, 61, '노포동 화물차 공영 차고지 조성사업 - 공사준공', 3303, 1674, 4977, 100, 100, 100, 'F08', '부산시 금정구 노포동 108-2번지 일원(노포I.C 인근)', '2012-06-01', '2016-12-31', '차고지 조성 43,093㎡, 주차334면, 건축 1,810㎡', 'B02', '051)888-6258', '269', 35.28451915, 129.1013895, 'SRID=4326;POINT (129.1013895 35.28451915)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(62, 62, '수영강하류 생태하천 조성사업', 4583, 394, 4977, 100, 100, 100, 'F06', '해운대구 재송동 좌수영교 옆', '2012-06-01', '2013-06-30', '보행.자전거램프 및 승강기 1기', 'B02', '051-888-4093', '17', 35.17483315, 129.1209513, 'SRID=4326;POINT (129.1209513 35.17483315)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(63, 63, '황령산 봉수대 관광자원화 사업', 4490, 457, 4947, 100, 100, 100, 'F06', '연제구 황령산 일원', '2012-07-01', '2013-10-01', '진입로 개설 및 주차장 설치 등', 'B02', NULL, '12', 35.16359905, 129.082866, 'SRID=4326;POINT (129.082866 35.16359905)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(64, 64, '산성터널접속도로(화명측) 건설공사 (3공구)', 2604, 2334, 4938, 100, 100, 100, 'F01', '화명현대아파트 일원', '2012-07-10', '2018-11-30', '지하차도 L=604m, 평면도로 L=476m, B=27\~50m', 'B01', '051-888-6411', '739억원', 35.23554392, 129.0203409, 'SRID=4326;POINT (129.0203409 35.23554392)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(65, 65, '군 수영부두 대체시설 건립', 3213, 1703, 4916, 100, 100, 100, 'F05', NULL, '2012-08-01', '2017-03-31', '소선박부두, 통합막사, 해상경계시설, 정비고, 이동식방호초소 등', 'B02', '051-888-6259', '220.7억원', 35.12015574, 129.0717345, 'SRID=4326;POINT (129.0717345 35.12015574)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(66, 66, '천마터널 건설(민자)', 2483, 2357, 4840, 100, 100, 100, 'F01', '사하구 구평동\~서구 암남동', '2012-10-16', '2019-03-31', '도로개설 L=3.28㎞, B=왕복4차로(자동차전용도로 : 19\~46m)rn▷ 터널 L=1.51㎞, 지하차도 L=1.17㎞, 교량 등 L=0.63㎞', 'B01', '051-888-6184,051-888-6181', '3,065억원(민자포함)', 35.08015928, 129.0217194, 'SRID=4326;POINT (129.0217194 35.08015928)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(67, 67, '강변하수처리장 여과설비 및 탈수기 증설☞공사완료', 4673, 151, 4824, 100, 100, 100, 'F03', '사하구 을숙도대로 466(강변하수처리장내)', '2012-11-01', '2013-04-01', '여과설비 증설 8대, 원심탈수기 증설 등 1식', 'B03', NULL, '35', 35.08381018, 128.9562932, 'SRID=4326;POINT (128.9562932 35.08381018)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(68, 68, '녹산하수처리장 미설치 기계설비 설치공사', 4521, 303, 4824, 100, 100, 100, 'F03', '강서구 녹산산단 382로 49번길 39', '2012-11-01', '2013-08-31', '생물반응조, 최종침전지, 자외선살균 설비 등', 'B03', NULL, '35', 35.08411583, 128.8636811, 'SRID=4326;POINT (128.8636811 35.08411583)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(69, 69, '회동동 화물차 공영 차고지 조성사업', 3730, 1094, 4824, 100, 100, 100, 'F02', '금정구 회동동 28번지 일원', '2012-11-01', '2015-10-31', '차고지 조성 A=80,149㎡, 도로개설 L=603, B=8.0m', 'B02', '051-888-6253', '430', 35.23624941, 129.1335769, 'SRID=4326;POINT (129.1335769 35.23624941)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(70, 70, '부산 중앙광장 조성사업', 4248, 576, 4824, 100, 100, 100, 'F06', '부산진구 부암1동 41-2번지 일원', '2012-11-01', '2014-05-31', '광장조성 A=34,740㎡rn- PC BOX설치 L=164Mrn- 선큰 근린생활시설 지하1층rn- 공공화장실 지상1층', 'B02', '051-888-4093', '241', 35.16614861, 129.0517645, 'SRID=4326;POINT (129.0517645 35.16614861)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(71, 71, '부산지식산업센터 건립공사☞공사완료', 3395, 1399, 4794, 100, 100, 100, 'F05', '북구 금곡동 812-8번지', '2012-12-01', '2016-09-30', '○ 사업개요rn- 위치 : 북구 금곡동 812번지(조달청 비축기지 내)rn- 규모 : 지하1/지상6층, 연면적 16,226.86㎡(부지면적 9,900㎡)rn- 사업비 : 300억원rn- 사업기간 : 2013 \~ 2016. 8.', 'B03', '051-888-6316', '300', 35.25597944, 129.0129379, 'SRID=4326;POINT (129.0129379 35.25597944)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(72, 72, '자원순환시설 건립☞공사완료', 3671, 1092, 4763, 100, 100, 100, 'F05', '자원순환특화단지(생곡)', '2013-01-01', '2015-12-29', '부지 8,250㎡, 2개동, 연면적 4,278㎡', 'B03', '051-888-6331', '223', 35.13494533, 128.8868675, 'SRID=4326;POINT (128.8868675 35.13494533)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(73, 73, '부산민속예술관 증.개축☞공사완료', 3592, 1171, 4763, 100, 100, 100, 'F05', '동래구 우장춘로 195번길 46(온천동, 금강공원내)', '2013-01-01', '2016-03-17', '노후(’74년도 건립)되고 협소한 부산민속예술관을 개축하여 쾌적한 시설로 개선rn부지면적 3,260㎡, 연면적 1,666㎡, 지상3층', 'B03', '051-888-6334', '45', 35.21902797, 129.0750575, 'SRID=4326;POINT (129.0750575 35.21902797)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(74, 74, '시립미술관 내 전시관 건립☞공사완료', 4033, 730, 4763, 100, 100, 100, 'F05', '해운대구 APEC로 58(우동)', '2013-01-01', '2015-01-01', '한국을 대표하는 세계적 현대미술 작가인 이우환 화백의 기증 작품을 전시 할 수 있는 명품 전시관 건립rn연면적 1,400㎡, 지하1층/지상2층', 'B03', '051-888-4254', '47', 35.1665484, 129.1370216, 'SRID=4326;POINT (129.1370216 35.1665484)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(75, 75, '황령산 봉수대 주변 조망쉼터 조성☞공사완료', 3975, 788, 4763, 100, 100, 100, 'F05', '남구 대연동 산53-1번지 일원 약 950㎡', '2013-01-01', '2015-02-28', '도심속 유원지로 관광객이 즐겨찾는 황령산봉수대 주변 조망쉼터 조성 rn연면적 약 276㎡, 지하1층', 'B03', '051-888-4225', '11', 35.15622468, 129.0840825, 'SRID=4326;POINT (129.0840825 35.15622468)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(76, 76, '수영하수처리장 노후 슬러지수집기 교체☞공사완료', 4278, 485, 4763, 100, 100, 100, 'F05', '동래구 온천천 남로 185번지(수영하수처리장내)', '2013-01-01', '2014-05-01', '내구연한 경과 등 노후된 기자재 교체로 하수처리효율 향상rn노후 슬러지수집기 교체 ▷ 종침 4지 16대(2수로 1구동)', 'B03', '051-500-2153', '12', 35.18752106, 129.1127191, 'SRID=4326;POINT (129.1127191 35.18752106)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(77, 77, '강변하수처리장 셍물반응조 산기관 교체☞공사완료', 4218, 545, 4763, 100, 100, 100, 'F05', '사하구 을숙도대로 466번지(강변하수처리장내)', '2013-01-01', '2014-06-30', '내구연한 경과 등 노후된 기자재 교체로 하수처리효율향상rn생물반응조 노후 산기관 4,468개 교체', 'B03', NULL, '12', 35.1044479, 128.974933, 'SRID=4326;POINT (128.974933 35.1044479)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(78, 78, '감전분구 하수관거정비(BTL)', 3700, 1032, 4732, 100, 100, 100, 'F03', '사상구 및 진구(개금동)일원', '2013-02-01', '2015-11-30', '하수관거=119㎞, 배수설비=8,017개소', 'B02', '051-888-6253', '605', 35.15261203, 128.9911421, 'SRID=4326;POINT (128.9911421 35.15261203)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(79, 79, '하수관거신설(확충)공사\[수영처리구역(반여동일원)]', 3017, 1702, 4719, 100, 100, 100, 'F03', '해운대구 반여동, 금정구 금사동 일원', '2013-02-14', '2017-10-13', '관서(D=80\~500mm) 31,849㎞, 배수설비 2,409가구', 'B02', '051-888-6261', '396억원', 35.20624865, 129.1311227, 'SRID=4326;POINT (129.1311227 35.20624865)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(80, 80, '남부공공하수처리시설 시설개선공사', 3152, 1491, 4643, 100, 100, 100, 'F03', '남구 용호동 29번지 일원', '2013-05-01', '2017-05-31', '신설처리시설 65,000톤/일, 기존시설개량: 275,000톤', 'B02', '051-888-6222', '1161억원', 35.12668753, 129.1161479, 'SRID=4326;POINT (129.1161479 35.12668753)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(81, 81, '남부하수처리시설 시설개선', 3152, 1491, 4643, 100, 100, 100, 'F03', '남구 용호동 이기대공원로 11(남부하수처리장 내)', '2013-05-01', '2017-05-31', '처리시설 신설 65,000톤/일, 기존시설 개량 275,000톤/일', 'B02', '051-888-6222', '1,161억원', 35.1315784, 129.1188633, 'SRID=4326;POINT (129.1188633 35.1315784)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(82, 82, '전포천 하천정비공사', 4248, 334, 4582, 100, 100, 100, 'F06', '부산진구 번전동(동해남부선)일원', '2013-07-01', '2014-05-31', '하천정비 L=184m', 'B02', NULL, '22', 35.16285537, 129.0531698, 'SRID=4326;POINT (129.0531698 35.16285537)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(83, 83, '하수관거신설(확충)공사\[남부처리구역(부산진구일원)]', 2907, 1636, 4543, 100, 100, 100, 'F03', '부산광역시 부산진구 개금동, 당감동, 부암동 일원', '2013-08-09', '2018-01-31', '관거 (D80\~600m) L=14.55km, 배수설비 N=868가구', 'B02', '051-888-6237', '188억원', 35.16774814, 129.0370881, 'SRID=4326;POINT (129.0370881 35.16774814)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(84, 84, '산성터널 건설(민자)', 2665, 1856, 4521, 100, 100, 100, 'F01', '북구 화명동\~금정구 장전동', '2013-08-31', '2018-09-30', 'L=5.62km, B= 27m\~42.4m(4차로)', 'B01', '051-888-6155', '3004억원', 35.24163075, 129.0238751, 'SRID=4326;POINT (129.0238751 35.24163075)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(85, 85, '하수관거 확충(개금.주례일원)', 2859, 1539, 4398, 100, 100, 100, 'F03', '부산광역시 부산진구 개금동,사상구 주례동 일동', '2014-01-01', '2018-03-20', '관거L=16.3km, 배수설비, 1,277가구', 'B02', '051-888-6254', '17,251백만원', 35.15424209, 128.9996308, 'SRID=4326;POINT (128.9996308 35.15424209)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(86, 86, '하수관거 정비(삼락.덕천, BTL)', 3456, 942, 4398, 100, 100, 100, 'F03', '사상구 삼락, 덕천동 일원', '2014-01-01', '2016-07-31', '낙동강 등 지천 수질 개선 및 쾌적한 생활환경 제공rn관거(D=80\~600㎜) L= 112.4km, 맨홀펌프장 6개소', 'B02', '051-888-6251', '575', 35.16570435, 128.9744072, 'SRID=4326;POINT (128.9744072 35.16570435)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(87, 87, '구 충무시설 보수정비 리모델링☞공사완료', 4248, 150, 4398, 100, 100, 100, 'F05', '수영구 수영로 521번길(광안동), 舊 충무시설', '2014-01-01', '2014-05-31', '인공동굴구조의 특수성을 이용 미디어아트 공간 조성rn연면적 3,740㎡, 지하1층', 'B03', '051-888-4284', '6', 35.14917294, 129.1083038, 'SRID=4326;POINT (129.1083038 35.14917294)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(88, 88, '차집시설 개량 및 통합관리시스템 구축', 2938, 1460, 4398, 100, 100, 100, 'F03', '부산광역시 일원', '2014-01-01', '2017-12-31', '차집시설정비 N=894개소, 통합관리시스템 1식', 'B02', '051-888-6225,051-888-6223', '274억원', 35.17662979, 129.0765693, 'SRID=4326;POINT (129.0765693 35.17662979)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(89, 89, '하수처리장 노후시설 개선', 3853, 545, 4398, 100, 100, 100, 'F03', '동래구 온천천남로 185 수영하수처리장 등 7개소', '2014-01-01', '2015-06-30', '노후 슬러지수집기교체 등 7개소', 'B03', '051-500-2153', '76', 35.18736162, 129.1135931, 'SRID=4326;POINT (129.1135931 35.18736162)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(90, 90, '반룡일반산업단지 진입도로 건설', 3262, 1136, 4398, 100, 100, 100, 'F01', '기장군 장안읍 국도14호선 \~ 반룡일반산업단지', '2014-01-01', '2017-02-10', 'L=342m B=15m(3차로)', 'B01', '051-888-6425', '68억원', 35.350849, 129.2491715, 'SRID=4326;POINT (129.2491715 35.350849)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(91, 91, '도심대형 재래시장 분류식 하수관로 설치', 3244, 1154, 4398, 100, 100, 100, 'F03', '부산진구 부전 \* 서면시장', '2014-01-01', '2017-02-28', '오수관로설치 L=8,127km, 배수설비 N= 1,046 개소', 'B02', '051-888-6265', '147', 35.16285537, 129.0531698, 'SRID=4326;POINT (129.0531698 35.16285537)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(92, 92, '대저119안전센터 건립공사☞공사완료', 3700, 698, 4398, 100, 100, 100, 'F05', '부산광역시 강서구 대저1동 684-7번지', '2014-01-01', '2015-11-30', '○ 사업개요rn- 위   치 : 강서구 대저1동 684-2번지rn- 규   모 : 지상3층, 연면적 754.97㎡rn- 사업비 : 16.84억원rn- 사업기간 : 2014 \~ 2015. 11.', 'B03', '051-888-6314', '16.84', 35.21634442, 128.9725585, 'SRID=4326;POINT (128.9725585 35.21634442)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(93, 93, '부산글로벌테크비즈센터 건립 공사☞공사완료', 2696, 1702, 4398, 100, 100, 100, 'F05', '강서구 미음R\&D허브단지 내 (미음동 1522-1)', '2014-01-01', '2018-08-30', '지상 9층, 연면적 12,956.54㎡rn', 'B03', '051-888-6315', '281억원', 35.16221636, 128.8670417, 'SRID=4326;POINT (128.8670417 35.16221636)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(94, 94, '첨단 표면처리 센터 건립☞공사완료', 2818, 1580, 4398, 100, 100, 100, 'F05', '강서구 미음지구 R\&D허브단지 내 I4-1, 미음동 1529-1번지', '2014-01-01', '2018-04-30', '- 규   모 : 지하1층/지상3층(2개동), 연면적 약 2,897㎡rn', 'B03', '051-888-6314', '74.87억원', 35.16248259, 128.8637995, 'SRID=4326;POINT (128.8637995 35.16248259)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(95, 95, '차집시설통합관리센터 건립(차집시설 개량 및 통합관리시스템 건축공사)☞공사완료', 3303, 1095, 4398, 100, 100, 100, 'F05', '동래구 안락동 1108번지(환경공단 내)', '2014-01-01', '2016-12-31', '차차집시설정비 N=1,059개소, 통합관리시스템 1식', 'B02', '051-888-6225', '86억원', 35.18628496, 129.1143556, 'SRID=4326;POINT (129.1143556 35.18628496)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(96, 96, '반여 시내버스 공영차고지 조성', 1112, 3286, 4398, 100, 100, 100, 'F06', '부산광역시 해운대구 반여동 496번지 일원', '2014-01-01', '2022-12-31', '차고지 조성 23,244㎡, 건물2,282㎡(124대) - 토목2팀 노기섭 , 보상팀(총부무): 오동열', 'B02', '051-888-6259,051-888-6092', '230억원', 35.2187334, 129.1221811, 'SRID=4326;POINT (129.1221811 35.2187334)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(97, 97, '수영강변대로\~삼어로간 연결도로 건설', 1826, 2572, 4398, 100, 100, 100, 'F01', '반여1동 수영강변대로 ∼ 반여4동 삼어로 일원', '2014-01-01', '2021-01-16', '도로건설 L=376m, B=12～15m, 번영로 선형개량400m,rn               교량L=228m(합성라멘교 60.0m, ST.BOX.GR 168.0m)', 'B01', '051-888-6182,051-888-6186', '194억원', 35.1947616, 129.1222598, 'SRID=4326;POINT (129.1222598 35.1947616)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(98, 98, '부산 그린레일웨이 조성사업(3차)', 2483, 1915, 4398, 100, 100, 100, 'F06', '해운대 기계공고～미포, 송정～동부산관광단지 경계', '2014-01-01', '2019-03-31', '휴식공간조성 L=9,800m (산책로, 자전거도로, 휴게시설 등)', 'B01', '051-888-6425', '316억원', 35.16324485, 129.1637105, 'SRID=4326;POINT (129.1637105 35.16324485)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(122, 122, '도심대형재래시장분류식하수관로설치공사(부전서면시장)', 2938, 1028, 3966, 100, 100, 100, 'F03', '부전 서면시장', '2015-03-09', '2017-12-31', '오수관로 (D200\~500mm) L=8,731km, 배수설비 N=790개소', 'B02', '051-888-6252', '148억원', 35.16012421, 129.0594701, 'SRID=4326;POINT (129.0594701 35.16012421)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(99, 99, '해운대수목원 조성사업(1단계 3차)', 3564, 729, 4293, 100, 100, 100, 'F06', '해운대구 석대동 24번지 일원', '2014-04-16', '2016-04-14', '○ 위     치 : 해운대구 석대동 24번지 일원 rn○ 규     모 : A=628,275㎡(1단계 414,994㎡, 2단계 213,281㎡)rn○ 사 업 비 : 97억원(도급 70, 관급 27)rn○ 기     간 : 2014. 4. 16 \~ 2016. 4. 14', 'B02', '888-6295', '97억원(도급 70, 관급 27)', 35.23016362, 129.1332418, 'SRID=4326;POINT (129.1332418 35.23016362)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(100, 100, '덕천오수중계펌프장 이설', 2938, 1311, 4249, 100, 100, 100, 'F03', '북구 구포동 덕천유수지 일원', '2014-05-30', '2017-12-31', '오수중계펌프장 (Q=160,000㎥/1개소rn차집관로 (1,200\~1,500㎜) : L=136m', 'B02', '051-888-6224', '117억원', 35.21023379, 129.0011459, 'SRID=4326;POINT (129.0011459 35.21023379)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(101, 101, '소방안전체험관 건립☞공사완료', 3602, 630, 4232, 100, 100, 100, 'F05', '동래구 온천동 330번지 일원(금강공원내)', '2014-06-16', '2016-03-07', '○ 사업개요rn- 위치 : 동래구 온천동 330번지 일원(금강공원 내)rn- 규모 :  지하1층/지상3층, 부지 16.192㎡, 연면적 7,888㎡rn- 사업비 : 293.74rn- 사업기간 : 2012. 6. \~ 2016. 3.', 'B03', '888-6315', '293.74', 35.21909024, 129.0756301, 'SRID=4326;POINT (129.0756301 35.21909024)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(102, 102, '레이저가공기술산업화지원센터 건립공사☞공사완료', 3714, 473, 4187, 100, 100, 100, 'F05', '강서구 미음지구 허브단지내', '2014-07-31', '2015-11-16', '○ 사업개요rn- 위   치 : 강서구 미음지구 허브지구 내 rn- 규   모 : 지하1/지상3층, 3,700㎡(부지면적 6,600㎡)rn- 사업비 : 101.06억원rn- 사업기간 : 2012. \~ 2015. 11.', 'B03', '051-888-6317', '101.06', 35.16183035, 128.8651893, 'SRID=4326;POINT (128.8651893 35.16183035)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(103, 103, '학리항정비공사(서방파제)', 3487, 577, 4064, 100, 100, 100, 'F05', '부산 기장군 일광면 학리항내', '2014-12-01', '2016-06-30', '동방파제 접안시설확장 71.0mrn서방파제 신설 80.0m', 'B02', '051-888-6265', '37.2억원', 35.25802784, 129.2447132, 'SRID=4326;POINT (129.2447132 35.25802784)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(104, 104, '동남권 방사선 의.과학일반산단 진입도로 건설', 2787, 1261, 4048, 100, 100, 100, 'F01', '일반산단 서측도로망\~국도14호선\~장안IC 연결', '2014-12-17', '2018-05-31', 'L=1,820m, 장안IC. 1개소(트럼펫->클로버)', 'B01', '051-888-6161', '487억원', 35.31293763, 129.242976, 'SRID=4326;POINT (129.242976 35.31293763)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(105, 105, '연지근린공원 조성공사', 3229, 810, 4039, 100, 100, 100, 'F06', '부산진구 초읍동 산66-1번지 일원', '2014-12-26', '2017-03-15', '공원조성 A = 57,380㎡rn', 'B02', '051-888-6292', '160억원', 35.17782309, 129.0499067, 'SRID=4326;POINT (129.0499067 35.17782309)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(106, 106, '아시아 영화학교 건립 리모델링☞공사완료', 3395, 638, 4033, 100, 100, 100, 'F05', '수영구 광안동 1276-1(舊 공무원교육원 생활관 건물)', '2015-01-01', '2016-09-30', '지하1층, 지상3층, 연면적1,709.91㎡, 철근콘크리트 건물 리모델링', 'B03', '051-888-6334', '20.47억원', 35.15041795, 129.1092576, 'SRID=4326;POINT (129.1092576 35.15041795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(107, 107, '부산박물관 전시관 리모델링☞공사완료', 3122, 911, 4033, 100, 100, 100, 'F05', '남구 유엔평화로 63(대연동) 부산박물관내', '2015-01-01', '2017-06-30', '부지면적 29,437㎡, 연면적 6,313㎡, 지하1층/지상2층', 'B03', '051-888-6336', '66.99억원', 35.12938967, 129.0934021, 'SRID=4326;POINT (129.0934021 35.12938967)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(108, 108, '부산도서관 건립', 2087, 1946, 4033, 100, 100, 100, 'F05', '사상구 덕포동 415-2번지 (상수도계량기 검사센터)', '2015-01-01', '2020-04-30', '지하2층/지하5층 부지면적 10,318㎡, 연면적 16.303㎡', 'B03', '051-888-6334', '420억원', 35.17297141, 128.983012, 'SRID=4326;POINT (128.983012 35.17297141)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(109, 109, '금련산 청소년 수련원 기능보강공사☞공사완료', 3730, 303, 4033, 100, 100, 100, 'F05', '수영구 광안4동 산60-3', '2015-01-01', '2015-10-31', '지하1층/지상3층 생활관, 야외화장실, 운동장 기능보강', 'B03', '051-888-6331', '10', 35.1551318, 129.1014352, 'SRID=4326;POINT (129.1014352 35.1551318)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(110, 110, '부산진소방서 건립☞공사완료', 2726, 1307, 4033, 100, 100, 100, 'F05', '부산시 진구 서전로43(전포동)', '2015-01-01', '2018-07-31', '부지면적 987㎡, 연면적 5,664.16㎡, 지하2층/지상7층rn', 'B03', '051-888-6316', '138.79억원', 35.15818158, 129.0645346, 'SRID=4326;POINT (129.0645346 35.15818158)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(111, 111, '청학119안전센터 건립☞공사완료', 3244, 789, 4033, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2015-01-01', '2017-02-28', '부지면적 566㎡, 연면적 750㎡, 지상3층', 'B03', '051-888-6335', '16.74억원', 35.09793824, 129.0566106, 'SRID=4326;POINT (129.0566106 35.09793824)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(112, 112, '녹산 및 중앙하수처리장 감시제어설비 교체', 3699, 334, 4033, 100, 100, 100, 'F03', '강서구 녹산산단 382로 49번길 39, 서구 암남동 원양로 6', '2015-01-01', '2015-12-01', '중앙감시제어설비 1식, 현장제어반설비(RCS) 1식 등', 'B03', '051-888-6383', '7.7억원', 35.08531359, 128.8794961, 'SRID=4326;POINT (128.8794961 35.08531359)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(113, 113, '하수처리장 노후시설 개선', 3669, 364, 4033, 100, 100, 100, 'F04', '동래구 온천천남로 185 수영하수처리장 등 12개소', '2015-01-01', '2015-12-31', '노후 슬러지수집기 교체 등 12개소', 'B03', '051-888-6355', '98', 35.18817419, 129.1124726, 'SRID=4326;POINT (129.1124726 35.18817419)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(114, 114, '자갈치 글로벌수산 명소화 건립☞공사완료', 2573, 1460, 4033, 100, 100, 100, 'F05', '중구 남포동 6가 117-3번지', '2015-01-01', '2018-12-31', '부지면적 2,240㎡(L=224m, B=10m) 연면적 2,288.03㎡ 지상2층', 'B03', '051-888-6317', '93.45억원', 35.09655942, 129.0261156, 'SRID=4326;POINT (129.0261156 35.09655942)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(115, 115, '근대건축문화자산(청자빌딩) 리모델링☞공사완료', 2943, 1090, 4033, 100, 100, 100, 'F05', '구 동광동 3가 11(구.한성은행 부산지점,청자빌링)', '2015-01-01', '2017-12-26', '지상3층, 연면적 652.46㎡', 'B03', '051-888-6334', '14억원', 35.10622698, 129.0323731, 'SRID=4326;POINT (129.0323731 35.10622698)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(116, 116, '자성고가교 철거 및 평면도로정비공사', 2208, 1825, 4033, 100, 100, 100, 'F01', '동구 범일동 330-24번지 일원(성남초등학교 주변 자성대교차로)', '2015-01-01', '2019-12-31', '자성고가교 철거 rnL=1,078mrnB=5\~9m', 'B01', '051-888-6424,051-888-6425', '86.5억', 35.1292668, 129.0453058, 'SRID=4326;POINT (129.0453058 35.1292668)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(117, 117, '해운대과선교 철거공사 실시설계용역', 2848, 1185, 4033, 100, 100, 100, 'F01', '해운대구 중동 1772번지 일원(해운대 온천사거리\~신시가지 방향)', '2015-01-01', '2018-03-31', '과선교 철거(L=580m, B=15m), 평면도로정비 1식', 'B01', '051-888-6422', '10,000백만원', 35.16306667, 129.1635961, 'SRID=4326;POINT (129.1635961 35.16306667)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(118, 118, '하수관거정비(대연용호분구BTL)', 2918, 1095, 4013, 100, 100, 100, 'F03', '남구대연동, 용호동일원', '2015-01-21', '2018-01-20', '하구관거 L=79,149km, 배수설비 N=8,782가구', 'B02', '051-888-6256', '720억원', 35.1418237, 129.0987233, 'SRID=4326;POINT (129.0987233 35.1418237)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(119, 119, '구포생태공원 수해복구공사', 3635, 364, 3999, 100, 100, 100, 'F03', NULL, '2015-02-04', '2016-02-03', '사면보강 L=800m, H=30m', 'B02', '051-888-6251', '72', 35.19463598, 129.0124768, 'SRID=4326;POINT (129.0124768 35.19463598)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(120, 120, '초량천 생태하천 복원사업', 1539, 2448, 3987, 100, 100, 100, 'F06', '동구하나은행\~부산고등학교 입구', '2015-02-16', '2021-10-30', '복개복원 L=316m, B=25m', 'B02', '051-888-6228', '370억원', 35.11924914, 129.0401899, 'SRID=4326;POINT (129.0401899 35.11924914)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(121, 121, '덕천교차로 일원 하수시설 개선복구사업', 3609, 365, 3974, 100, 100, 100, 'F03', '부산시 덕천교차로 일원', '2015-03-01', '2016-02-29', 'PC암거(1.0\*1.5) L=102m,(1.5\*1.0) L=244m', 'B02', '051-888-6254', '21.48억원', 35.21050797, 129.0052703, 'SRID=4326;POINT (129.0052703 35.21050797)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(123, 123, '동천 명품보행전용교량 건설공사', 3537, 406, 3943, 100, 100, 100, 'F01', '남구 문현금융단지 앞 동천내', '2015-04-01', '2016-05-11', '보행교량 L=41.7m, B=6\~12m', 'B01', '051-888-6422', '37', 35.13975166, 129.0704099, 'SRID=4326;POINT (129.0704099 35.13975166)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(124, 124, '강변하수 소화조효율 개선', 3303, 640, 3943, 100, 100, 100, 'F03', '사하구 을숙도대로 466(강변하수처리장 내)', '2015-04-01', '2016-12-31', '소화조 시설용량 40,000㎥(5,000㎥× 8조)', 'B03', '051-888-6364', '130억원', 35.08166795, 128.9550141, 'SRID=4326;POINT (128.9550141 35.08166795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(125, 125, '덕천 오수중계 펌프장 이설 전기,소방공사', 3288, 611, 3899, 100, 100, 100, 'F01', '북구 구포동 덕천유수지 일원', '2015-05-15', '2017-01-15', '동력설비 1식, 전등,전열 설비1식', 'B01', '051-888-6383', '123백만원', 35.20965069, 129.0004399, 'SRID=4326;POINT (129.0004399 35.20965069)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(126, 126, '덕천오수중펌프장 이설 기계공사', 3303, 579, 3882, 100, 100, 100, 'F01', '북구 구포동 덕천유수지 일원', '2015-06-01', '2016-12-31', '배관 및 지자재 설치 1식(배관공사,펌프,호이스트 등)', 'B03', '051-888-6362', '2,679백만원', 35.21009202, 129.0009997, 'SRID=4326;POINT (129.0009997 35.21009202)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(127, 127, '도시고속도로 주변 방음시설 설치공사', 2208, 1660, 3868, 100, 100, 100, 'F01', '해운대구 건영LIG Apt. 일원', '2015-06-15', '2019-12-31', '방음터널설치 L=300m', 'B01', '051-888-6153', '2,480백만원', 35.17808299, 129.181489, 'SRID=4326;POINT (129.181489 35.17808299)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(128, 128, '오리일반산업단지 진입도로 건설', 2741, 1116, 3857, 100, 100, 100, 'F01', '기장군 장안읍 오리(국도14호선) \~ 오리일반산업단지', '2015-06-26', '2018-07-16', 'L=1,040m B=22\~30m(4차로)', 'B01', '051-888-6417', '158억원', 35.36714929, 129.2622308, 'SRID=4326;POINT (129.2622308 35.36714929)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(129, 129, '자동차부품 글로벌 품질인증센터 건립☞공사완료', 2818, 1034, 3852, 100, 100, 100, 'F05', '강서구 미음R\&D허브단지(I7-1), 미음동 1528-9번지', '2015-07-01', '2018-04-30', '지하1층/ 지상2층, 연면적 약3,953.46㎡rn', 'B03', '051-888-6314', '109.8억원', 35.16172607, 128.8661087, 'SRID=4326;POINT (128.8661087 35.16172607)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(130, 130, '만덕119안전센터 건립☞공사완료', 3152, 700, 3852, 100, 100, 100, 'F05', '북구 만덕동 944-1번지', '2015-07-01', '2017-05-31', '부지면적 1,112㎡, 연면적 897.75㎡, 지상4층', 'B03', '051-888-6336', '17.14억원', 35.20490655, 129.0331301, 'SRID=4326;POINT (129.0331301 35.20490655)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(131, 131, '문화회관 중극장 리모델링사업☞공사완료', 2969, 883, 3852, 100, 100, 100, 'F05', '남구 유엔평화로 76번길 1', '2015-07-01', '2017-11-30', '지하1층, 지상3층, 연면적 7,210㎡ 중극장 및 부대시설 리모델링', 'B03', '051-888-6334', '96억원', 35.12922815, 129.0891859, 'SRID=4326;POINT (129.0891859 35.12922815)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(132, 258, '부산환경체험교육관 건립사업', 293, 1548, 1841, 100, 100, 100, 'F05', '부산광역시 해운대구 재반로242번길 51-10', '2021-01-01', '2025-03-29', '본관 동관(1\~3층)리모델링 및 내진보강공사', 'B03', '051-888-6316', '100억원', 35.1987524, 129.1351425, 'SRID=4326;POINT (129.1351425 35.1987524)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(133, 132, '연지근린공원 내 생태체험센터 건립☞공사완료', 3317, 516, 3833, 100, 100, 100, 'F05', '부산진구 초읍동 산66-1일원', '2015-07-20', '2016-12-17', '- 건축개요 : 지하2층/지상2층, 연면적 3,881.05㎡rn- 건 축 비 : 70.53억원(공사 68.23, 감리 2.3)rn- 공사기간 : ’15.07.20 \~ ’16.10.11   rn- 시 공 사 : 천우종합토건㈜ + ㈜티엘갤러리rn- 감     리 : ㈜삼영기', 'B03', '051-888-6314', '70.53', 35.1800403, 129.0488209, 'SRID=4326;POINT (129.0488209 35.1800403)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(134, 133, '노포동 화물차 공영차고지 건축공사☞공사완료', 3303, 528, 3831, 100, 100, 100, 'F05', '금정구 노포동 108-2번지', '2015-07-22', '2016-12-31', '지하1층, 지상2층, 연면적 1,810㎡, R.C조', 'B03', '051-888-6258', '24', 35.28461686, 129.1009524, 'SRID=4326;POINT (129.1009524 35.28461686)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(135, 134, '군 수영부두 대체시설 건립(동원막사) 기계설비공사☞공사완료', 3244, 546, 3790, 100, 100, 100, 'F01', NULL, '2015-09-01', '2017-02-28', '위생설비 등 1식(배관공사,펌프)', 'B01', '051-888-6355', '465백만원', 35.11955633, 129.0709515, 'SRID=4326;POINT (129.0709515 35.11955633)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(136, 135, '하수관로 신설공사수영처리구역\[한양아파트]일원]', 1402, 2374, 3776, 100, 100, 100, 'F03', '연제구 연산 1, 8, 9동 일원', '2015-09-15', '2022-03-16', '관로(D=200\~600mm) L=27.250km, 배수설비 3,089개소', 'B02', '051-888-6247', '370억원', 35.1897161, 129.103621, 'SRID=4326;POINT (129.103621 35.1897161)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(137, 136, '부산 그린레일웨이 조성사업(1차)', 3305, 463, 3768, 100, 100, 100, 'F06', '해운대 올림픽교차로 \~ 기장군 동부산관광단지 경계', '2015-09-23', '2016-12-29', '휴식공간조성 L=1,600m (산책로, 자전거도로, 휴게시설)', 'B01', '051-888-6426', '2,794백만원', 35.16249375, 129.1623738, 'SRID=4326;POINT (129.1623738 35.16249375)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(138, 137, '하수관로신설(확층)공사(장림처리구역(하단동일원))', 1855, 1898, 3753, 100, 100, 100, 'F03', '사하구 하단동 일원', '2015-10-08', '2020-12-18', '하수관거 L=16.134㎞, 배수설비 N=1,715가구', 'B02', '051-888-6251', '289억원', 35.1044479, 128.974933, 'SRID=4326;POINT (128.974933 35.1044479)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(139, 138, '원동IC \~ 올림픽 교차로간 BRT 설치 전기공사', 3113, 622, 3735, 100, 100, 100, 'F01', '부산 동래구 원동ic', '2015-10-26', '2017-07-09', '전기인입 공사 1식, 가로등 설치26본', 'B03', '051-888-6374', '2.7억원', 35.19632571, 129.1132106, 'SRID=4326;POINT (129.1132106 35.19632571)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(140, 139, '구덕전통문화체험관 건립☞공사완료', 3122, 609, 3731, 100, 100, 100, 'F05', '서구 서대신3가 산18-1번지(구덕문화공원)', '2015-10-30', '2017-06-30', '연면적 808㎡, 지상3층', 'B03', '051-888-6336', '38', 35.12582163, 129.0049246, 'SRID=4326;POINT (129.0049246 35.12582163)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(141, 140, '진태고개 생태축 연결사업', 3004, 679, 3683, 100, 100, 100, 'F01', '기장군 정관면 모전리 13-7번지 일월', '2015-12-17', '2017-10-26', '생태교량 L=38.8m, B=33.8m\~42.8m 등', 'B01', '051-888-6207', '55억원', 35.35691335, 129.1446234, 'SRID=4326;POINT (129.1446234 35.35691335)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(142, 141, 'APEC기후센터 증축사업☞공사완료', 2787, 881, 3668, 100, 100, 100, 'F05', '해운대구 센텀7로 12', '2016-01-01', '2018-05-31', '증축 1개층(4층부분), 증축면적 533.62㎡rn', 'B03', '051-888-6316', '17억원', 35.17390681, 129.1254709, 'SRID=4326;POINT (129.1254709 35.17390681)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(143, 142, '하수관로 확충(해운대, 송정해수욕장일원)', 2585, 1083, 3668, 100, 100, 100, 'F03', '해운대구 중동, 송정동 일원', '2016-01-01', '2018-12-19', '하수관로(D=80\~300mm) L=11,406km, 배수설비 681가구', 'B02', '051-888-6228', '157억원', 35.16308836, 129.1635923, 'SRID=4326;POINT (129.1635923 35.16308836)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(144, 143, '노동복지회관 전면 개보수☞공사완료', 3244, 424, 3668, 100, 100, 100, 'F05', '동구 자성로 141번길 13(범일동 830-240번지)', '2016-01-01', '2017-02-28', '노후된 시설물 보수·보강하여 건물 안전성을 높임', 'B03', '051-888-6318', '10', 35.1385174, 129.0656395, 'SRID=4326;POINT (129.0656395 35.1385174)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(145, 144, '한국신발관 리모델링☞공사완료', 2907, 761, 3668, 100, 100, 100, 'F05', '부산진구 백양대로 227', '2016-01-01', '2018-01-31', '지하1층\~3층 연면적 4,141㎡(리모델링)rn-역사전시관, 멀티호옵관, 교육.체험학습관, 인력양성관, 기업 비지니스 지원 등', 'B03', '051-888-6332', '29.54억원', 35.16133741, 129.0346127, 'SRID=4326;POINT (129.0346127 35.16133741)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(146, 145, '구포119안전센터 재건축 사업☞공사완료', 2907, 761, 3668, 100, 100, 100, 'F05', '북구 만덕대로 31', '2016-01-01', '2018-01-31', '부지면적 421.8㎡, 연면적 841.95㎡, 지상4층', 'B03', '051-888-6335', '18.1억원', 35.21081441, 129.0041798, 'SRID=4326;POINT (129.0041798 35.21081441)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(147, 146, '지사119안전센터 건립공사☞공사완료', 2938, 730, 3668, 100, 100, 100, 'F05', '강서구 지사동 1218-3번지', '2016-01-01', '2017-12-31', '지상4층 1개동, 연면적 958.49㎡', 'B03', '051-888-6335', '17.15억원', 35.21219795, 128.9805706, 'SRID=4326;POINT (128.9805706 35.21219795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(148, 147, '생곡쓰레기 매립장(2-1단계) 조성공사-공사준공', 534, 3134, 3668, 100, 100, 100, 'F04', '강서구 생곡동 생곡산단로 90 (봉화산일원)', '2016-01-01', '2024-07-31', '쓰레기 매립, 복토 V=2,168천㎥', 'B02', '051-888-6225', '194억원', 35.12728759, 128.8726221, 'SRID=4326;POINT (128.8726221 35.12728759)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(149, 148, '부산패션비즈센터 건립 공사', 1538, 2130, 3668, 100, 100, 100, 'F05', '동구 범일동 26-4번지', '2016-01-01', '2021-10-31', '연면적 7,677㎡rn지하2/지상6', 'B03', '051-888-6316', '293억원', 35.13879776, 129.0608195, 'SRID=4326;POINT (129.0608195 35.13879776)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(150, 149, '모전교\~협성르네상스간 도로개설(용역)', 2208, 1460, 3668, 100, 100, 100, 'F01', '기장군 정관읍 모교전\~정관 협성르네상스아파트', '2016-01-01', '2019-12-31', '도로개설L=637m, B=25m', 'B01', '051-888-6201', '16,000백만원', 35.23150199, 129.2122643, 'SRID=4326;POINT (129.2122643 35.23150199)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(151, 150, '시민 친화적 구덕 운동장 재개발사업', 2665, 1003, 3668, 100, 100, 99.9, 'F05', '서구 서대신동 3가 210-1번지 일원', '2016-01-01', '2018-09-30', '생활체육공원 조성 1식(A=35,600㎡)', 'B02', '051-888-6245', '105억원', 35.11569534, 129.015611, 'SRID=4326;POINT (129.015611 35.11569534)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(152, 151, '덕천동\~아시아드주경기장(만덕3터널) 도로 건설', 947, 2702, 3649, 100, 100, 100, 'F01', '북구 만덕동～연제구 거제동', '2016-01-20', '2023-06-14', '도로건설 L=4,370m, B=20\~45m(4차로)rn - 도로정비 1,680m, 터널 2,241m, 접속도로 449m', 'B01', '051-888-6185,051-888-6187', '1,510억원', 35.20466337, 129.035803, 'SRID=4326;POINT (129.035803 35.20466337)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(153, 152, '하단119안전센터 건립☞공사완료', 2999, 638, 3637, 100, 100, 100, 'F05', '사하구 낙동남로1407', '2016-02-01', '2017-10-31', '지상5층 1개동, 연면적 808.23㎡, 부지면적 340.10㎡', 'B03', '051-888-6318', '18.84억원', 35.10651255, 128.9656746, 'SRID=4326;POINT (128.9656746 35.10651255)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(154, 153, '레포츠 섬유발전 기반구축사업', 2848, 789, 3637, NULL, NULL, NULL, 'F05', '강서구 미음동 1528-1번지', '2016-02-01', '2018-03-31', '염·가공 융합소재 및 섬유산업 기술지원체제 구축', NULL, '888-6313', '265억원', 35.21219795, 128.9805706, 'SRID=4326;POINT (128.9805706 35.21219795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(155, 154, '부산광역시 노인회관 건립☞공사완료', 2573, 1064, 3637, 100, 100, 100, 'F05', '부산진구 전포동 123', '2016-02-01', '2018-12-31', '지하1층 / 지상8층, 부지면적 466㎡, 연면적 2,288㎡', 'B03', '051-888-6335', '67억원', 35.16338362, 129.0606936, 'SRID=4326;POINT (129.0606936 35.16338362)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(156, 155, '2016년 하수처리장 노후시설개선사업', 3060, 577, 3637, 100, 100, 100, 'F03', '사하구 원양로 6(중앙하수처리장) 외 3개소', '2016-02-01', '2017-08-31', '공공하수처리시설 노후 기자채 교체 1식rnrn       >원심탈수기 교체 4대(중앙 2, 녹산 1, 서부 1)rnrn       >강변공공하수처리시설 송풍기(370㎥/분) 1대 교체rn', 'B03', '051-888-6364', '19.1억원', 35.1044479, 128.974933, 'SRID=4326;POINT (128.974933 35.1044479)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(157, 156, '부산남항 유람선 선착장 구축사업', 2787, 850, 3637, 100, 100, 100, 'F08', '부산광역시 중구 자갈치시장 전면 해상 일원', '2016-02-01', '2018-05-31', '유람선 선착장(pontoon) 구축 L=53m, B=15m', 'B01', '051-888-6157', '29.12억원', 35.09665939, 129.025526, 'SRID=4326;POINT (129.025526 35.09665939)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(158, 157, '덕천 오수중계 펌프장 이설 정보통신공사', 3288, 323, 3611, 100, 100, 100, 'F01', '북구 구포동 덕천유수지 일원', '2016-02-27', '2017-01-15', '구내통신 1식,CCTV 1식', 'B03', '051-888-6385', '46,652천원', 35.20991404, 129.0008636, 'SRID=4326;POINT (129.0008636 35.20991404)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(159, 158, '무형문화재 기능분야 전수교육관 건립', 2634, 974, 3608, 100, 100, 100, 'F05', '수영구 광안동 산106번지(구 공무원교육원 뒤편 주차장 부지)', '2016-03-01', '2018-10-31', '지상3층, 연면적 1,797㎡', 'B03', '051-888-6317', '41억원', 35.14553823, 129.113134, 'SRID=4326;POINT (129.113134 35.14553823)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(160, 159, '부산섬유 산업진흥센터 건립공사☞공사완료', 2422, 1186, 3608, 100, 100, 100, 'F05', '강서구 미음동 1528-1', '2016-03-01', '2019-05-31', '부지면적 11,862㎡, 연면적 3,330㎡, 지상3층 , 지상2층 2개동', 'B03', '051-888-6316', '83.97억원', 35.15222202, 128.8722997, 'SRID=4326;POINT (128.8722997 35.15222202)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(161, 160, '덕천(화명)\~양산간 도로 개설 전기공사', 3293, 291, 3584, 100, 100, 100, 'F01', '북구 덕천(화명)동 ～ 양산시 경계', '2016-03-25', '2017-01-10', '가로등설치 79본,교량점검등 398등', 'B01', '051-888-6382', '1,405백만원', 35.19729594, 128.9900366, 'SRID=4326;POINT (128.9900366 35.19729594)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(162, 161, '동천 하상준설공사', 3258, 323, 3581, 100, 100, 100, 'F01', '동천(광무교\~범일교)일원', '2016-03-28', '2017-02-14', '\*사업규모: 하상준설 L=1,77km V=34,698㎥ rnrnrn', 'B01', '051-888-6421', '3,000백만원', 35.1492294, 129.0599854, 'SRID=4326;POINT (129.0599854 35.1492294)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(163, 162, '첨단신발융합허브센터 건립☞공사완료', 2634, 944, 3578, 100, 100, 100, 'F05', '사상구 감전동 515-4번지', '2016-03-31', '2018-10-31', '연면적 20,477㎡, 지상6층', 'B03', '051-888-6334', '430억원', 35.13273521, 128.9668972, 'SRID=4326;POINT (128.9668972 35.13273521)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(164, 163, '수정터널 상부공간 연결(공원화) 사업\[준공]', 2208, 1369, 3577, 100, 100, 100, 'F06', '부산진구 가야동 관문대로(수정터널입구\~요금소)', '2016-04-01', '2019-12-31', 'A=9,000㎡(L=180m, B=40\~70m)', 'B01', '051-888-6184,051-888-6181', '228.2억원', 35.14934681, 129.0333047, 'SRID=4326;POINT (129.0333047 35.14934681)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(165, 164, '하수관로 정비(수민분구, BTL)', 2620, 943, 3563, 100, 100, 100, 'F03', '부산광역시 동래구 금정구 일원', '2016-04-15', '2018-11-14', '하수관로(D=200～700㎜) L=97.976km, 배수설비 8,754가구', 'B02', '051-888-6252', '808억원', 35.20496978, 129.083672, 'SRID=4326;POINT (129.083672 35.20496978)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(166, 165, '금강공원 주차장 조성사업', 714, 4264, 3550, 1, 100, 1, 'F06', '부산광역시 동래구 온천동 276-3번지 일원', '2016-04-28', '2027-12-31', 'A=7,198㎡, 주차면수 193대', 'B02', '051-888-6236', '218억원', 35.21814409, 129.0751009, 'SRID=4326;POINT (129.0751009 35.21814409)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(167, 166, '군수영부두 대체시설 건립(소선박부두) 전기공사☞공사완료', 3234, 287, 3521, 100, 100, 100, 'F05', NULL, '2016-05-27', '2017-03-10', '옥외전기공사 1식, 옥외조명탕설비공사 1식', 'B03', '051-888-6384', '376백만원', 35.11927033, 129.0708127, 'SRID=4326;POINT (129.0708127 35.11927033)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(168, 167, '장안\~임랑간 도로건설 가로등 설치공사', 3018, 495, 3513, 100, 100, 100, 'F06', NULL, '2016-06-04', '2017-10-12', '가로등 설치 133본(1등용 83본,2등용 50본)', 'B03', '051-888-6371', '5.42억원', 35.32611325, 129.2438678, 'SRID=4326;POINT (129.2438678 35.32611325)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(169, 168, '첨단신발융합허브센터 건립사업(정보통신 분야)', 2966, 541, 3507, 100, 100, 100, 'F01', '사상구 감전동 515-4번지', '2016-06-10', '2017-12-03', 'CCTV카메라 2M 31대, 전관방송(1,800W).통합배선설비 1식', 'B03', '051-888-6375', '691백만원', 35.13281664, 128.9668772, 'SRID=4326;POINT (128.9668772 35.13281664)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(170, 169, '부산 그린레일웨이 조성사업(2차)', 2958, 532, 3490, 100, 100, 100, 'F06', '해운대 기계공고\~미포, 송정\~동부산관광단지 경계', '2016-06-27', '2017-12-11', '휴식공간조성 L=3,400m (산책로, 자전거도로, 휴게시설 등)', 'B01', '051-888-6426', '4,189백만원', 35.16308836, 129.1635923, 'SRID=4326;POINT (129.1635923 35.16308836)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(171, 170, '청학119안전센터 건립사업(정보통신분야)☞공사완료', 3244, 242, 3486, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2016-07-01', '2017-02-28', 'cctv카메라 2m 4대, 전관방송(240w).통합배선설비 1식rn', 'B01', '051-888-6375', '89백만원', 35.09785672, 129.0561041, 'SRID=4326;POINT (129.0561041 35.09785672)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(172, 171, '군수영부두 대체시설(동원막사) 정보통신공사☞공사완료', 3241, 221, 3462, 100, 100, 100, 'F05', NULL, '2016-07-25', '2017-03-03', '통합배선,방송설비,cctv카메라 설치 각1식', 'B03', '051-888-6385', '340백만원', 35.11880418, 129.0706693, 'SRID=4326;POINT (129.0706693 35.11880418)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(173, 172, '청학119안전센터 건립 (전기공사)☞공사완료', 3277, 183, 3460, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2016-07-27', '2017-01-26', '수전전력100kW,  전력간선.전열.전등 설비공사', 'B03', '051-888-6374', '1.71억원', 35.09792581, 129.0562813, 'SRID=4326;POINT (129.0562813 35.09792581)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(174, 173, '청학119안전센터 건립 (소방공사)☞공사완료', 3277, 183, 3460, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2016-07-27', '2017-01-26', '자동화재탐지 설비공사 1식, 유도등 설비공사 1식', 'B01', '051-888-6374', '0.15억원', 35.09717286, 129.0560431, 'SRID=4326;POINT (129.0560431 35.09717286)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(175, 174, '영상산업센터 2단계 ☞공사완료', 2999, 441, 3440, 100, 100, 100, 'F05', '해운대구 센텀서로 39(우동)/ 1466-2번지', '2016-08-16', '2017-10-31', '- 규모 : 지상4∼12층 증축연면적 9,221.29㎡rn', 'B03', '051-888-6316', '195.5억원', 35.17325026, 129.1320607, 'SRID=4326;POINT (129.1320607 35.17325026)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(176, 175, '부산시청사 로비 리모델링 사업☞공사완료', 2938, 456, 3394, 100, 100, 100, 'F05', '부산시청 로비(1\~2층 및 지하철연결통로)', '2016-10-01', '2017-12-31', '로비(1∼2층)및 지하철연결통로, 사업대상면적 8,688.57㎡rn', 'B03', '051-888-6314', '36억원', 35.17977539, 129.074959, 'SRID=4326;POINT (129.074959 35.17977539)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(177, 176, '한국야구 명예의 전당 건립', 1630, 1764, 3394, 0, 0, 0, 'F05', '기장군 일광면 동백리 409 일원', '2016-10-01', '2021-07-31', '지하1층, 지상3층, 연면적 3,000㎡(전시관 바닥면적 1,500㎡)', 'B03', '051-888-6335', '108억원', 35.30816276, 129.2458342, 'SRID=4326;POINT (129.2458342 35.30816276)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(178, 177, '부산 탁구체육관 설립☞공사완료', 2239, 1155, 3394, 100, 100, 100, 'F05', '영도구 동삼동 1163번지(동삼혁신도시)', '2016-10-01', '2019-11-30', '지상2층, 연면적 1,288㎡, 운동시설', 'B03', '051-888-6335', '4,061백만원', 35.09123989, 129.0678888, 'SRID=4326;POINT (129.0678888 35.09123989)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(179, 178, '부산희망드림종합센터 건립', 1910, 1453, 3363, 100, 100, 100, 'F05', '동구 좌천동 68-836번지(부산진역 인근)', '2016-11-01', '2020-10-24', '부지면적 1,271㎡, 연면적 981.58㎡, 지상3층', 'B03', '518886318', '55.26억원', 35.12861493, 129.0491111, 'SRID=4326;POINT (129.0491111 35.12861493)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(180, 179, '온천천 상류 일원 하수관로 신설(확충)', 1510, 1825, 3335, 100, 100, 100, 'F07', '금정구 남산동 부곡동일원', '2016-11-29', '2021-11-28', '관로공사 L=32.1km, 배수설비 2,788가구', 'B02', '051-888-6254', '44,542백만원', 35.27296846, 129.0856632, 'SRID=4326;POINT (129.0856632 35.27296846)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(181, 180, '하수관로신설(확충)공사 \[초량천수계]', 1510, 1825, 3335, 100, 100, 100, 'F07', '부산광역시 동구 충장대로 206 \~', '2016-11-29', '2021-11-28', '하수관로(D80\~400mm) L=33,16km 배수설시 N=5,245가구', 'B02', '051-888-6244', '478.4억원', 35.11629097, 129.0467405, 'SRID=4326;POINT (129.0467405 35.11629097)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(182, 181, '재송동 일원 하수관로 신설(확충)', 2392, 941, 3333, 100, 100, 100, 'F03', '해운대구 재송동, 반여동 일원', '2016-12-01', '2019-06-30', '관거(D=200∼400㎜) L=8.37km, 배수설비 1,025가구', 'B02', '051-888-6254', '130억원(공사 103, 감리 10, 기타 17) ▷ 국비39, 시비91', 35.18844953, 129.1224907, 'SRID=4326;POINT (129.1224907 35.18844953)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(183, 182, '을숙도대교 장림고개간 지하차도 건설', 808, 2525, 3333, 100, 100, 100, 'F01', '사하구 신평동(을숙도대교)\~구평동(장림고개)', '2016-12-01', '2023-10-31', '도로건설 L=2.310m, B=21.7m\~35.0m(4차로\~6차로)rnrn                 ▷지하차도 1,410m 터널 590m 포함,  도로정비 310mrnrn', 'B01', '051-888-6155', '2,526억원', 35.08503648, 128.9718248, 'SRID=4326;POINT (128.9718248 35.08503648)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(184, 183, '하수관로 확충(개금·부전동일원)', 2087, 1246, 3333, 100, 100, 100, 'F07', '부산진구 개금동, 부전동 일원', '2016-12-01', '2020-04-30', '하수관로(D80∼400㎜) L=9.655㎞, 배수설비 972가구', 'B02', '051-888-6245', '179억원', 35.15709406, 129.0205494, 'SRID=4326;POINT (129.0205494 35.15709406)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(185, 184, '부산역광장 국가선도 도시재생사업', 2453, 880, 3333, 100, 100, 100, 'F05', '동구 초량동 1192번지 일원(부산역 광장)', '2016-12-01', '2019-04-30', '지하1층, 지상2층, 연면적 4,790.25㎡, 문화집회시설 건출물rnrn         연결데크시설(부산역주차장 ↔ 간선도로 버스베이)rnrnrn              '' 시설물: H 7m, B 13m 보행자 연결테크(부산역 주차장\~버스베', 'B03', '051-888-6332', '224억원', 35.11411417, 129.0411586, 'SRID=4326;POINT (129.0411586 35.11411417)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(186, 185, '원전부품.설비 통합인증센터 건립☞공사완료', 2269, 1064, 3333, 100, 100, 100, 'F05', '강서구 미음동 1528-7(미음R\&D 허브단지내)', '2016-12-01', '2019-10-31', '연면적 2,902㎡rn지상1\~2층, 3개동', 'B03', '051-888-6316', '129억', 35.21219795, 128.9805706, 'SRID=4326;POINT (128.9805706 35.21219795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(187, 186, '일광공공하수처리시설 건설공사', 1903, 1400, 3303, 100, 100, 100, 'F03', '기장군 일광면 삼성리 454번지 일원', '2016-12-31', '2020-10-31', '하수처리시설 Q=9,000㎥, 방류관로 L=1,67km', 'B02', '051-888-6222', '356억원', 35.25821635, 129.2208345, 'SRID=4326;POINT (129.2208345 35.25821635)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(188, 187, '중부소방서 재건축', 2050, 1252, 3302, 100, 100, 100, 'F05', '중구 중앙대로 110(중앙동4가 83-2 외 1필지)', '2017-01-01', '2020-06-06', '지상6층, 연면적 4,266.71㎡', 'B03', '051-888-6315', '105억원', 35.10698233, 129.0365503, 'SRID=4326;POINT (129.0365503 35.10698233)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(189, 188, '망미119안전센터 건립', 2573, 729, 3302, 100, 100, 100, 'F05', '수영구 연수로328(망미동 792-10 외 2필지)', '2017-01-01', '2018-12-31', '지상3층 1개동, 연면적 620㎡, 부지면적 463.2㎡', 'B03', '051-888-6316', '39.04억원', 35.14553823, 129.113134, 'SRID=4326;POINT (129.113134 35.14553823)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(190, 189, '도시고속도로 방음시설 설치공사', 2938, 364, 3302, 100, 100, 100, 'F01', '사업개요 - 담당자: 도로1팀 신승모 051 888 6156', '2017-01-01', '2017-12-31', '방음시설(터널)설치 L=533m(동서고가 300m,해운대233m)', 'B01', '051-888-6155', '55억원', 35.16306667, 129.1635961, 'SRID=4326;POINT (129.1635961 35.16306667)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(191, 190, '생곡음식물쓰레기 자원화\[발전]시설 대수선사업☞공사완료', 2726, 576, 3302, 100, 100, 100, 'F05', '강서구 생곡산단로 76', '2017-01-01', '2018-07-31', '전처리시설, 혐기성소화설비, 악취제거설비 등', 'B03', '051-888-6355', '40억원', 35.21219795, 128.9805706, 'SRID=4326;POINT (128.9805706 35.21219795)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(192, 191, '산성구조구급센터 건립☞공사완료', 2757, 545, 3302, 100, 100, 100, 'F05', '금정구 금성면 143-7번지 (부지연적 745㎡)', '2017-01-01', '2018-06-30', '지상3층, 연면적 660㎡', 'B03', '051-888-6332', '16.3억원', 35.24277705, 129.0921041, 'SRID=4326;POINT (129.0921041 35.24277705)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(193, 192, '부산남항 물양장 확충사업☞공사완료', 2514, 757, 3271, 100, 100, 100, 'F08', '부산광역시 중구 남포동6가 117-3번지 전면해상', '2017-02-01', '2019-02-28', '잔교식 물양장 L=224.0m x B=35.5m', 'B01', '051-888-6157', '199억', 35.09656431, 129.028517, 'SRID=4326;POINT (129.028517 35.09656431)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(194, 193, '수산식품특화단지 폐수처리장 운영개선 사업', 2208, 1063, 3271, 100, 100, 100, 'F03', '부산광역시 사하구 장림로 89', '2017-02-01', '2019-12-31', '고도처리시설(6000㎥/일)', 'B03', '051-888-6352', '90.23억원(공사80, 설계3.2, 감리7.03)', 35.1044479, 128.974933, 'SRID=4326;POINT (128.974933 35.1044479)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(195, 194, '문현,대연동 일원 분류식 하수관로신설', 1477, 1787, 3264, 100, 100, 100, 'F07', '부산광역시 남구 문현동, 대연동 일원', '2017-02-08', '2021-12-31', '오수관거 L=21.1Km, 배수설비 N=1,698가구', 'B02', '051-888-6244', '299.3억원', 35.14773891, 129.0818034, 'SRID=4326;POINT (129.0818034 35.14773891)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(196, 195, '하수관로 정비\[사직.장전분구,BTL]', 2063, 1095, 3158, 100, 100, 100, 'F03', '금정구, 동래구, 연제구 일원', '2017-05-25', '2020-05-24', '관로(D80\~D600mm) L=87.695km, 배수설비N=10,170가구', 'B02', '051-888-6254', '794억원', 35.20496978, 129.083672, 'SRID=4326;POINT (129.083672 35.20496978)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(197, 196, '자갈치글로벌 수산명소화 해수인입시설 설치☞공사완료', 2254, 897, 3151, 100, 100, 100, 'F05', '부산광역시 중구 남포동6가 117-3번지 남항 물양장 전면 해상', '2017-06-01', '2019-11-15', '해수인입시설 등 1식', 'B03', '051-888-6364', '18.25억원', 35.10622698, 129.0323731, 'SRID=4326;POINT (129.0323731 35.10622698)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(198, 197, '부산 사회복지종합센터 건립', 1143, 2008, 3151, 100, 100, 100, 'F05', '동래구 낙민로 25(낙민동 127-4번지)', '2017-06-01', '2022-11-30', '부지면적 2,970.90㎡, 연면적 4,655.64㎡, 지상6층', 'B03', '888-6334', '214.4억원', 35.20050687, 129.0893415, 'SRID=4326;POINT (129.0893415 35.20050687)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(199, 198, '동천생태하천복원(수질개선)사업', 1936, 1207, 3143, 100, 100, 100, 'F01', '부산진구 광무교\~동구 북항입구', '2017-06-09', '2020-09-28', '도수펌프장:Q=25만㎥/일, 도수관로: D800\~1650, L=2,478m', 'B01', '051-888-6416', '281억원', 35.16285537, 129.0531698, 'SRID=4326;POINT (129.0531698 35.16285537)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(200, 199, '녹산하수 소화조 설치사업', 931, 2198, 3129, 100, 100, 100, 'F03', '강서구 녹산산단382로49번길 39 녹산하수처리시설내', '2017-06-23', '2023-06-30', '소화조(5,300㎥/일 4조) 및 교반 가온설비, 부대설비 1식rn(051-973-7445)', 'B03', '051-888-6362', '409억원(공사 386, 기타 23) ▷ 국비 96  시비 313', 35.08784408, 128.8644457, 'SRID=4326;POINT (128.8644457 35.08784408)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(201, 200, '마린시티 월파방지시설\[TTP] 재해복구공사', 2963, 149, 3112, 100, 100, 100, 'F02', '해운대구 우동 1447번지 전면 공유수면 일원', '2017-07-10', '2017-12-06', '월파방지시설(TTP)설치 N=1,555개 (16ton/개, L=640m)', 'B02', '051-888-6231', '3,428백만원', 35.15382903, 129.1438866, 'SRID=4326;POINT (129.1438866 35.15382903)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(202, 201, '수영만 자연재해위험개선지구 정비사업', 714, 3773, 3059, 15.9, 18.1, 87.85, 'F01', '해운대구 우3동 수영만(마린시티 앞) 일원 전면 해상', '2017-09-01', '2027-12-31', '방재시설 이안제(T.T.P) L=500m', 'B01', '051-888-6202,051-888-6201', '696억원', 35.15359059, 129.1436115, 'SRID=4326;POINT (129.1436115 35.15359059)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(203, 202, '해운대과선교 철거 및 평면도로 정비공사', 2809, 239, 3048, 100, 100, 100, 'F01', '해운대구 중동 1772번지 일원(해운대 온천사거리～신시가지 방향)', '2017-09-12', '2018-05-09', '과선교 철거(L=580m, B=15m), 평면도로정비 1식', 'B01', '051-888-6421', '5,979백만원', 35.16306667, 129.1635961, 'SRID=4326;POINT (129.1635961 35.16306667)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(204, 203, '하수관로신설확충(남부처리구역가야분구Ⅰ일원)', 1477, 1512, 2989, 100, 100, 100, 'F03', '부산진구 당감동, 가야동, 개금동 일원', '2017-11-10', '2021-12-31', '관로(D=150～300mm) L=7.766㎞, 배수설비 816가구', 'B02', '051-888-6245', '113억원', 35.15527951, 129.0454346, 'SRID=4326;POINT (129.0454346 35.15527951)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(205, 204, '구]구포교  수중교각 등 잔재물 처리공사', 2208, 764, 2972, 100, 100, 100, 'F04', '북구 구포2동 ～ 강서구 대저1동 구) 구포교 수중교각 일원', '2017-11-27', '2019-12-31', '수중교각 및 잔재물 처리((구)구포교 P6～P27)', 'B01', '051-888-6201', '12.5억', 35.19729594, 128.9900366, 'SRID=4326;POINT (128.9900366 35.19729594)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(206, 205, '2018 하수처리장 노후시설 개선사업', 2330, 607, 2937, 100, 100, 100, 'F03', '수영사업소 등 9개사업소', '2018-01-01', '2019-08-31', '노후 슬러지수집기 교체 등 26건 - 건조시설 2건 제외', 'B03', '051-888-6354', '141억원', 35.14553823, 129.113134, 'SRID=4326;POINT (129.113134 35.14553823)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(207, 206, '부산문화회관 연습실 조성', 2269, 668, 2937, 100, 100, 100, 'F05', '남구 유엔평화로76번길(대연동) - 문화회관 내', '2018-01-01', '2019-10-31', '연면적 733㎡rn지상2층', 'B03', '051-888-6335', '19억원(명시이월)', 35.13652979, 129.0842428, 'SRID=4326;POINT (129.0842428 35.13652979)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(208, 207, '고시편집실(집현관) 이전 리모델링☞공사완료', 2453, 484, 2937, 100, 100, 100, 'F05', '북구 금곡동 1910번지', '2018-01-01', '2019-04-30', '연면적 617.34m² 지상2', 'B03', '051-888-6335', '3.78억원', 35.26827619, 129.0212854, 'SRID=4326;POINT (129.0212854 35.26827619)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(209, 208, '2018 노후하수시설물 개선사업', 2330, 607, 2937, 100, 100, 100, 'F03', '수영사업소 등 9개', '2018-01-01', '2019-08-31', '악취방지시설설치 등 26건', 'B03', '051-888-6354', '141억원', 35.14548376, 129.1131567, 'SRID=4326;POINT (129.1131567 35.14548376)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(210, 209, '감동진 문화포구 조성사업', 1326, 1611, 2937, 100, 100, 100, 'F01', '북구 구포동 166\~화명생태공원', '2018-01-01', '2022-05-31', '금빛노을브릿지(인도교) L=382m, B=3m, 역사체험관 1식', 'B01', '051-888-6154,051-888-6205', '187억원', 35.20995807, 129.0031046, 'SRID=4326;POINT (129.0031046 35.20995807)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(211, 210, '신평장림산업단지 개방형 체육관 건립', 761, 2176, 2937, 100, 100, 100, 'F05', '사하구 신평동 651-9', '2018-01-01', '2023-12-17', '연면적 2,163.58㎡, 지하1층/지상2층', 'B03', '051-888-6315', '125억원', 35.09308203, 128.9597273, 'SRID=4326;POINT (128.9597273 35.09308203)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(212, 211, '노동복지회관 전면 개보수☞공사완료', 2483, 395, 2878, 100, 100, 100, 'F05', '동구 자성로141번길 13', '2018-03-01', '2019-03-31', '노후시설 개보수로 사용자 편의제공 및 이용 활성화', 'B03', '888-6312', '5억원', 35.13839167, 129.0656143, 'SRID=4326;POINT (129.0656143 35.13839167)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(213, 212, '차세대 재활복지의료기기지원센터 건립', 1508, 1339, 2847, 100, 100, 100, 'F05', '사하구 다대동 933-8 외 1필지(부지 1,622.5㎡)', '2018-04-01', '2021-11-30', '연면적 3,894㎡, 지하1층/지상3층', 'B03', '051-888-6336', '130.5억원', 35.05876806, 128.9711928, 'SRID=4326;POINT (128.9711928 35.05876806)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(214, 213, '하수관로 정비(중앙․초량․범천분구, BTL)', 1741, 1095, 2836, 100, 100, 100, 'F03', '부산광역시 중구, 동구, 부산진구 일원', '2018-04-12', '2021-04-11', '하수관로(D80\~D800mm) L=74.3Km, 배수설비 N=13,025가구', 'B02', '051-888-6246', '743억원', 35.1292668, 129.0453058, 'SRID=4326;POINT (129.0453058 35.1292668)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(215, 214, '하수관로 정비(전포,범천,문현분구, BTL)', 1737, 1095, 2832, 100, 100, 100, 'F07', '부산진구, 남구(문현동), 동구(범일동) 일원, 전포범천문현분구(5.80㎢)', '2018-04-16', '2021-04-15', '하수관로(D=150～600㎜) L=89.574km, 배수설비 10,307가구', 'B02', '051-888-6241', '850억원', 35.17949493, 129.0750232, 'SRID=4326;POINT (129.0750232 35.17949493)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(216, 215, '상수원보호구역내 기존관로 정비 및 오수관로 설치공사', 1856, 974, 2830, 100, 100, 100, 'F03', '회동상수원보호구역 일원(부산시 금정구, 기장군, 양산시 일원)', '2018-04-18', '2020-12-17', '기존하수관거 보수(D250～300mm) L=3.263kmrn 하수관거 신설(D80～200mm) L=4.688km, 배수설비598가구', 'B02', '051-888-6254', '120억원', 35.17882246, 129.0748251, 'SRID=4326;POINT (129.0748251 35.17882246)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(217, 216, '하수관로 신설(확충)공사\[해운대처리구역(미포,청사포일원)]', 1715, 1102, 2817, 100, 100, 100, 'F03', NULL, '2018-05-01', '2021-05-07', '관로(D=200\~300mm) L=20.151㎞, 배수설비 1,075개소', 'B02', '051-888-6254', '271억원', 35.15888094, 129.1799226, 'SRID=4326;POINT (129.1799226 35.15888094)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(218, 217, '시청사 노후 승강기 교체 사업', 1752, 1065, 2817, 100, 100, 100, 'F05', '부산광역시 연제구 중앙대로1001(부산시청)', '2018-05-01', '2021-03-31', '22대(고·저층용 12대, 의회4,비상2, 기타 4대)', 'B03', '051-888-6354', '58억', 35.18569871, 129.0605545, 'SRID=4326;POINT (129.0605545 35.18569871)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(219, 218, '정관하수처리장 여과설비 개선공사', 2261, 549, 2810, 100, 100, 100, 'F03', '부산광역시 기장군 정관읍 예림리 1098-1번지 일원', '2018-05-08', '2019-11-08', '여과시설 개선(32,000㎥/일, 상향류식 사여과시설)', 'B02', '051-888-6226', '48억원', 35.24411464, 129.2193184, 'SRID=4326;POINT (129.2193184 35.24411464)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(220, 219, '도심대형 재래시장 분류식 하수관로 설치공사(국제·부평시장)', 1722, 1082, 2804, 100, 100, 100, 'F03', '중구 광복동, 부평동 일원', '2018-05-14', '2021-04-30', '관로(D=200\~300mm) L=6.349㎞, 배수설비 1,330개소', 'B02', '051-888-6242', '184억원', 35.10086347, 129.0274064, 'SRID=4326;POINT (129.0274064 35.10086347)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(221, 220, '부산오페라하우스 건립', 349, 3144, 2795, 65.75, 65.95, 99.7, 'F05', '북항재개발지구 해양문화지구내', '2018-05-23', '2026-12-31', '- 규   모 : 지하2층/지상5층, 연면적 51,617㎡rn- 시설내용 : 공연장1,800석', 'B03', '051-888-6322', '3,117억원', 35.10833291, 129.0451816, 'SRID=4326;POINT (129.0451816 35.10833291)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(222, 221, '당감택지지구 등 노후관로 정비사업', 2329, 457, 2786, 100, 100, 100, 'F07', '당감, 거제, 반여택지지구, 민락매립지, 신리삼거리\~연산R', '2018-06-01', '2019-09-01', '노후오수관로 정비 L=6.17Km', 'B02', '051-888-6246', '60억원', 35.18009707, 129.0740672, 'SRID=4326;POINT (129.0740672 35.18009707)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(223, 222, '문전교차로 지하차도 건설', 1265, 1465, 2730, 100, 100, 100, 'F01', '문전교차로 일원(부산진구 전포동 전포지구대 ～ 남구 문현동 부산국제금융센터)', '2018-07-27', '2022-07-31', 'L=435.7m, B=8.0～8.5m(2차로 하행 편도)', 'B01', '051-888-6204', '282억원', 35.15142584, 129.0654172, 'SRID=4326;POINT (129.0654172 35.15142584)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(224, 223, '재난안전산업지원센터 건립', 785, 1879, 2664, 100, 100, 100, 'F05', '동래구 수안동 666-10 외 1필지(668-3)', '2018-10-01', '2023-11-23', '지상5층, 연면적 1,972.13㎡', 'B03', '051-888-6332', '197.9억원', 35.2015796, 129.0793783, 'SRID=4326;POINT (129.0793783 35.2015796)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(225, 224, '부산시민회관 내진보강 공사', 2208, 456, 2664, 100, 100, 100, 'F05', '동구 자성로 133번길 16, 부산시민회관', '2018-10-01', '2019-12-31', '연면적 14,929.08㎡, 지하1층/지상4층', 'B03', '888-6312', '15억원', 35.13890358, 129.0651885, 'SRID=4326;POINT (129.0651885 35.13890358)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(226, 225, '부산남항 물양장 확충사업 2차', 1569, 1059, 2628, 100, 100, 100, 'F08', '부산광역시 중구 남포동5가 117-7번지 전면해상', '2018-11-06', '2021-09-30', '잔교식 물양장 L= 198.0m, B= 10.5∼35.5m', 'B01', '051-888-6161', '180억원(공사 160,설계비 7, 감리비 13) ▷전액국비', 35.09638767, 129.0293789, 'SRID=4326;POINT (129.0293789 35.09638767)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(227, 226, '부산남항 수제선(방재호안) 정비사업', 1346, 1276, 2622, 100, 100, 100, 'F05', '서구 등대로 전면해상(서방파제 일원)', '2018-11-12', '2022-05-11', '수제선 정비 L=543m', 'B02', '051-888-6224', '462억원', 35.0835805, 129.026233, 'SRID=4326;POINT (129.026233 35.0835805)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(228, 227, '부산남항 수제선(방재호안) 정비공사', 1346, 1276, 2622, 100, 100, 100, 'F05', '서구 등대로 전면해상(서방파제 일원)', '2018-11-12', '2022-05-11', '방재호안 L=543m', 'B02', '051-888-6222', '46,171백만원', 35.08419158, 129.0263358, 'SRID=4326;POINT (129.0263358 35.08419158)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(229, 228, '의류제조 소공인집적지구 공동인프라 증축☞공사완료', 2392, 211, 2603, 100, 100, 100, 'F05', '동구 범일동 830-163번지', '2018-12-01', '2019-06-30', '영세의류제조 소공인 경쟁력 및 부산섬유패션 산업활성화', 'B03', '051-888-6315', '9억원', 35.14022071, 129.0619305, 'SRID=4326;POINT (129.0619305 35.14022071)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(230, 229, '기장하수처리장 여과설비 개선공사', 2113, 478, 2591, 100, 100, 100, 'F03', '부산광역시 기장군 기장읍 신천리 254-2번지 일원', '2018-12-13', '2020-04-04', '여과시설개선(13,500㎥/일, 가압부상식)', 'B02', '051-888-6226', '2,334백만원(토목 958, 기계, 914, 전기 312, 감리 150)', 35.24481659, 129.2272133, 'SRID=4326;POINT (129.2272133 35.24481659)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(231, 230, '양정동 일원 하수관로 신설(확충)', 836, 1749, 2585, 100, 100, 100, 'F07', '부산진구 양정1·2동, 연제구 거제동 일원', '2018-12-19', '2023-10-03', '하수관로(D150∼D600mm) L=17.908km, 배수설비 1,266가구', 'B02', '051-888-6251', '375억원(공사 332, 감리 22, 기타 21) ▷ 국비111, 시비264', 35.17222363, 129.0686431, 'SRID=4326;POINT (129.0686431 35.17222363)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(232, 231, '해운대처리구역 송정이송관로 설치공사', 2033, 547, 2580, 100, 100, 100, 'F07', '해운대구 송정동, 좌동 일원', '2018-12-24', '2020-06-23', '유량조정조 V=3,000㎥, 압송관로 L=3.13㎞ 등', 'B02', '051-888-6257', '97.2억원', 35.16310231, 129.163619, 'SRID=4326;POINT (129.163619 35.16310231)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(233, 232, '부산시민회관 지붕개선 및 무대자동화사업', 2056, 516, 2572, 100, 100, 100, 'F05', '동구 자성로 133번길 16, 부산시민회관', '2019-01-01', '2020-05-31', '연면적 14,929.08㎡, 지하1층/지상4층rn※ 무대자동화 사업은 기계1팀에서 별도 시행', 'B03', '051-888-6336,051-888-6354', '37억원', 35.13885178, 129.0650555, 'SRID=4326;POINT (129.0650555 35.13885178)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(234, 233, '하수관로 확충 \[보덕포 상류 일원]', 1067, 1505, 2572, 100, 100, 100, 'F07', '사하구 장림동 일원 (보덕포상류 및 장림시장 일원)', '2019-01-01', '2023-02-14', '하수관로(D80∼400㎜) L=7.`84㎞, 배수설비 1,618가구rn', 'B02', '051-888-6244', '297억원(공사267,기타30) ▷국비 74, 시비 223', 35.08104599, 128.9656114, 'SRID=4326;POINT (128.9656114 35.08104599)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(235, 234, '남부 하수 찌꺼기 감량화시설 개량사업', 1538, 1033, 2571, 100, 100, 100, 'F03', '남구 이기대로 11(남부하수처리장 내)', '2019-01-02', '2021-10-31', '소화가스 발전설비(600kW) 설치 1식', 'B03', '051-888-6354', '86.21억원', 35.1261944, 129.1149725, 'SRID=4326;POINT (129.1149725 35.1261944)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(236, 235, '삼한맨션\~과정교차로간 도로건설', 1774, 789, 2563, 100, 100, 100, 'F01', '동래구 수안동 삼한맨션\~연제구 거제동 과정교차로', '2019-01-10', '2021-03-09', '󰏚 사업개요 rn  ❍ 필 요 성 : 교통정체가 극심한 도심지 교통난 해소 및 지역균형개발 촉진rn  ❍ 구    간 : 동래구 수안동 삼한맨션\~연제구 거제동 과정교차로rn  ❍ 사업규모 : 도로개설 L=400m,', 'B01', '051-888-6424', '190억원', 35.19504711, 129.0871817, 'SRID=4326;POINT (129.0871817 35.19504711)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(237, 236, '하수관로신설(확충)공사\[남부처리구역(동천수계일원)]', 1089, 1474, 2563, 100, 100, 100, 'F07', '부산진구 당감동․동구 안창마을․남구 문현동', '2019-01-10', '2023-01-23', '오수관로설치 L=12.948km, 배수설비 N=1,384개소', 'B02', '051-888-6247', '396억원(공사270, 감리17 등 )  국비 110  시비 286', 35.13587906, 129.0692148, 'SRID=4326;POINT (129.0692148 35.13587906)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(238, 237, '동부산공공하수처리시설 설치공사', 562, 1979, 2541, 100, 100, 100, 'F03', '기장군 장안읍 좌동리 산64-4번지 일원', '2019-02-01', '2024-07-03', '하수처리시설 Q=5,000㎥/일, 방류관로 L=350m', 'B02', '051-888-6224', '35,498백만원 (국비 10,419, 시비 10,419, 원인자 14,660)', 35.31560129, 129.2470513, 'SRID=4326;POINT (129.2470513 35.31560129)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(239, 238, '동부산하수처리구역 오수관로 설치공사', 908, 1439, 2347, 100, 100, 100, 'F07', '부산광역시 기장군 장안읍, 임랑, 월내 일원', '2019-08-14', '2023-07-23', '분류식 오수관로 신설(D80\~600㎜, L=23.4㎞),  배수설비 1,315가구, 중계펌프장 1개소', 'B02', '051-888-6254', '498억원', 35.31616934, 129.2436369, 'SRID=4326;POINT (129.2436369 35.31616934)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(240, 239, '수영처리구역 오수관로 정비사업 1단계(온천천 일원)', 2011, 331, 2342, 100, 100, 100, 'F07', '금정구, 동래구 온천천일원', '2019-08-19', '2020-07-15', '비굴착(D900\~1200mm) 전체보수 L=3.34㎞rn비굴착(D500\~1200mm) 부분보수 85개소 등', 'B02', '051-888-6257', '72억원(공사 6,519, 감리 558, 기타 200)', 35.20561394, 129.078493, 'SRID=4326;POINT (129.078493 35.20561394)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(241, 240, '부산 어린이 VR 재난안전체험 교육장 건립', 2153, 179, 2332, 100, 100, 100, 'F05', '수영구 광안동 1034-4번지 고가도로 밑', '2019-08-29', '2020-02-24', '1개동, 지상2층, 연면적 391.48m², 제2종근린생활시설', 'B03', '051-888-6331', '20억원', 35.16977015, 129.1084844, 'SRID=4326;POINT (129.1084844 35.16977015)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(242, 241, '동김해IC\~식만JCT간 광역도로 건설', 427, 1827, 2254, 100, 100, 100, 'F01', '김해시 어방동(동김해IC)∼강서구 식만동(식만JCT)', '2019-11-15', '2024-11-15', '도로개설 L=4.6km, B=20∼35.5m', 'B01', '051-888-6421', '897억원(공사 555, 보상 296, 기타 46) ▷ 국비 419.7, 시비 419.8', 35.22341003, 128.9061778, 'SRID=4326;POINT (128.9061778 35.22341003)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(243, 242, '만덕\~센텀 도시고속화도로 건설', 49, 2191, 2240, 84, 74.4, 94.76, 'F01', '북구 만덕동(만덕대로)～해운대구 재송동(수영강변대로)', '2019-11-29', '2025-11-28', '지하도로 L=9,620m, B=11\~27.5m(왕복 4차로), IC 3개소', 'B01', '051-888-6154,051-888-6156,051-888-6157', '7,901억원(공사 6,552, 감리 187, 보상 202, 기타 960)', 35.21307359, 129.0319063, 'SRID=4326;POINT (129.0319063 35.21307359)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(244, 243, '부산광역시 농업기술센터 건립공사', 1567, 669, 2236, 100, 100, 100, 'F05', '강서구 공항로 1285(현 위치)', '2019-12-03', '2021-10-02', '부지면적 8,062㎡, 연면적 5,757㎡, 지상4층 2개동', 'B03', '051-888-6315', '199억원', 35.21360819, 128.9866794, 'SRID=4326;POINT (128.9866794 35.21360819)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(245, 244, '해운대 소각시설 대보수사업', 1246, 973, 2219, 100, 100, 100, 'F04', '해운대구 해운대로 898(부산환경공단 해운대사업소)', '2019-12-20', '2022-08-19', '소각시설 200톤/일(생활폐기물 190톤, 건조슬러지 10톤)', 'B03', '051-888-6352', '435.71억원', 35.17484071, 129.1843876, 'SRID=4326;POINT (129.1843876 35.17484071)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(246, 245, '남항 항만시설물(계류시설) 내진보강 공사', 1118, 1095, 2213, 100, 100, 100, 'F08', '부산남항(중구,서구 물양장, 영도굴항) 일원', '2019-12-26', '2022-12-25', '내진보강(그라우팅) L=2,301m, 천공 3,529공, 약액주입 9,201공', 'B01', '051-888-6161', '17,069백만원', 35.09465924, 129.0254984, 'SRID=4326;POINT (129.0254984 35.09465924)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(247, 246, '드론산업 허브센터 구축', 412, 1795, 2207, 100, 100, 100, 'F05', '부산광역시 강서구 지사동 1277번지', '2020-01-01', '2024-11-30', '지상4층, 연면적 1,811.9㎡, 공작물 563.2㎡', 'B03', '051-888-6332', '93.85억원', 35.14521062, 128.8244666, 'SRID=4326;POINT (128.8244666 35.14521062)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(248, 247, '하수관로 신설(확충)공사 (북구제척지 일원)', 40, 2009, 1969, 71.4, 73.1, 97.67, 'F07', '북구 제척지 일원', '2020-08-26', '2026-02-25', '하수관로(D=80\~350㎜) L=15.803㎞, 배수설비 1,862가구', 'B02', '051-888-6246', '401억원', 35.23199751, 129.0125208, 'SRID=4326;POINT (129.0125208 35.23199751)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(249, 248, '하수관로 신설(확충)공사 (사상구제척지 일원)', 99, 2068, 1969, 67.67, 67.67, 100, 'F07', '사상구 강변처리구역 내 제척지 일원(정비사업 해제지 등)', '2020-08-26', '2026-04-25', '하수관로(D80\~250mm) L=21.330km, 배수설비 3,155가구', 'B02', '051-888-6245', '453억원', 35.16536788, 128.9850661, 'SRID=4326;POINT (128.9850661 35.16536788)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(250, 249, '수영처리구역(온천천) 오수관로 정비사업 2차', 1418, 496, 1914, 100, 100, 100, 'F07', NULL, '2020-10-20', '2022-02-28', '오수관로(D1,200\~D1,500mm) 비굴착 전체보수 L=3.286km', 'B02', '051-888-6254', '106억원(공사 9,215백만원, 감리 1,378백만원)', 35.19402962, 129.0897465, 'SRID=4326;POINT (129.0897465 35.19402962)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(251, 250, '수영처리구역(온천천) 오수관로 정비사업 3차', 1381, 533, 1914, 100, 100, 100, 'F07', NULL, '2020-10-20', '2022-04-06', '오수관로(D1,200\~1,500mm) 비굴착 전체보수 L= 1.639km', 'B02', '051-888-6254', '47억원(공사 4,714백만원)', 35.19763447, 129.0813636, 'SRID=4326;POINT (129.0813636 35.19763447)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(252, 251, '분뇨처리시설 현대화사업', 381, 1492, 1873, 100, 100, 100, 'F03', '사상구 낙동대로943번길 157(감전동, 위생처리장 내)', '2020-11-30', '2024-12-31', '부지집약화(지하화) A=14,900㎡rn처리용량 Q=2,100㎥/일rn건축면적 A=2,355.51㎡(지하3층, 지상2층)', 'B02', '051-888-6222', '108,700,000,000원', 35.13837506, 128.9681025, 'SRID=4326;POINT (128.9681025 35.13837506)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(253, 252, '동부산권 수소버스충전소 구축', 1120, 742, 1862, 100, 100, 100, 'F05', '기장군 기장읍 청강리 416번지 청강리공영차고지', '2020-12-11', '2022-12-23', '지상1층, 3동, 연면적 563㎡, 충전시설', 'B03', '051-888-6355', '67억원', 35.22379978, 129.2126262, 'SRID=4326;POINT (129.2126262 35.22379978)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(254, 253, '신평장림 산업단지 혁신지원센터 건립', 1112, 746, 1858, 100, 100, 100, 'F05', '사하구 장림동 1080-3', '2020-12-15', '2022-12-31', '부지 1,650m² ,  지상5층, 연면적 2,844.44m²', 'B03', '051-888-6315', '105억원', 35.10441526, 128.9749453, 'SRID=4326;POINT (128.9749453 35.10441526)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(255, 254, '수산식품특화단지 기업지원센터 건립공사', 1022, 835, 1857, 100, 100, 100, 'F05', '사하구 장림동 1082-8번지', '2020-12-16', '2023-03-31', '부지면적 2,598.1㎡, 연면적 5,236.78㎡, 지하1층/지상4층', 'B03', '051-888-6334', '132억원', 35.08089966, 128.959063, 'SRID=4326;POINT (128.959063 35.08089966)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(256, 255, '우암부두 지식산업센터 건립', 1054, 791, 1845, 100, 100, 60, 'F05', '남구 우암동 265-1번지 외 1', '2020-12-28', '2023-02-27', '부지면적 6,000㎡, 연면적 9,306.48㎡, 지상6층', 'B03', '051-888-6315', '228.57억원', 35.12101537, 129.0778435, 'SRID=4326;POINT (129.0778435 35.12101537)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(257, 256, '부산시립미술관 리모델링', 134, 1975, 1841, 45.9, 46.4, 98.92, 'F05', '부산광역시 해운대구 우동 1413번지 외 3필지', '2021-01-01', '2026-05-30', '지하2/지상3층, 연면적 22,297.3㎡(기존 21,426㎡, 증축 871㎡)', 'B03', '051-888-6312', '456억원', 35.16667527, 129.136981, 'SRID=4326;POINT (129.136981 35.16667527)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(258, 257, '50+복합지원센터 건립사업', 116, 1957, 1841, 52, 52, 100, 'F05', '부산광역시 동래구 낙민동 127-4번지 일원', '2021-01-01', '2026-05-12', '󰏚 사업개요(2021\~2026)rn ㅇ 추진배경 : 신중년의 재취업, 창업, 여가․커뮤니티 활동 등 종합플랫폼 구축rn ㅇ 위    치 : 동래구 낙민동 127-8번지 일원rn ㅇ 규   모 : 지상4층, 연면적 3,038.8㎡, 노유', 'B03', '051-888-6335', '196억원', 35.19762676, 129.0912219, 'SRID=4326;POINT (129.0912219 35.19762676)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(259, 259, '식만\~사상간(대저대교) 도로건설', 1690, 3521, 1831, 3, 3, 100, 'F01', '강서구 식만동(식만JCT)\~사상구 삼락동(사상공단)', '2021-01-11', '2030-09-02', '도로건설 L=8,240m, B=20m', 'B01', '051-888-6412,051-888-6416', '3,934억원', 35.18764669, 128.9606237, 'SRID=4326;POINT (128.9606237 35.18764669)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(260, 260, '북구지역 소방서 구축사업', 911, 850, 1761, 100, 100, 100, 'F05', '부산광역시 북구 금곡대로616번길 151 외2', '2021-03-22', '2023-07-20', '지하2층/지상8층, 연면적 6,604.35㎡', 'B03', '051-888-6332', '196.2억원', 35.26200457, 129.014779, 'SRID=4326;POINT (129.014779 35.26200457)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(261, 261, '부산남항 서방파제 재해취약지구 정비사업', 234, 1925, 1691, 76.4, 73.3, 104.23, 'F01', '서구 남부민동 서방파제(남부민방파제) 전면해상', '2021-05-31', '2026-09-07', '방파제 확충 L=365m, B=25→65m(증 40m)', 'B01', '051-888-6202,051-888-6205', '460억원', 35.08573069, 129.028605, 'SRID=4326;POINT (129.028605 35.08573069)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(262, 262, '하수관로 신설(확충)공사 (신평동 일원)', 578, 1097, 1675, 100, 100, 100, 'F07', '사하구 신평동 일원', '2021-06-16', '2024-06-17', '하수관로(D=150\~200㎜) L=5.6㎞, 배수설비 1,270가구(정화조 폐쇄 포함)', 'B02', '051-888-6247', '191억원', 35.09215731, 128.9761627, 'SRID=4326;POINT (128.9761627 35.09215731)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(263, 263, '하수관로 신설(확충)공사 (대저처리분구 일원)', 349, 1989, 1640, 31.62, 32.17, 98.29, 'F07', '강서구 대저동 일원', '2021-07-21', '2026-12-31', '하수관로(D=80\~200㎜) L=23.1㎞, 배수설비 1,067가구', 'B02', '051-888-6241', '486억원', 35.1749083, 128.954786, 'SRID=4326;POINT (128.954786 35.1749083)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(264, 264, '공중화장실 배수설비 연결 정비공사', 1275, 364, 1639, 100, 100, 100, 'F07', '14개 구군 공중화장실(북구, 중구 제외)', '2021-07-22', '2022-07-21', '오수관로 (D80\~D250 L=3.17km), 배수설비 48개소', 'B02', '051-888-6258', '4,841벡만원', 35.17965041, 129.07489, 'SRID=4326;POINT (129.07489 35.17965041)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(265, 265, '강서 시내버스 공영차고지 조성사업(토목)', 1023, 608, 1631, 100, 100, 100, 'F08', '부산광역시 강서구 화전동 산74번지 일원', '2021-07-30', '2023-03-30', '차고지 조성 A=50,140㎡', 'B02', '051-888--6225', '160억 원', 35.10110759, 128.8663487, 'SRID=4326;POINT (128.8663487 35.10110759)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(266, 266, '부산복합혁신센터 건립공사', 402, 1226, 1628, 100, 100, 100, 'F05', '동삼 혁신지구내 (영도구 동삼동 1158번지)', '2021-08-02', '2024-12-10', '- 부지면적 5,132㎡ , 연면적 4,339.71㎡, 지하2층, 지상3층rn- 제1,2종 근린생활시설', 'B03', '051-888-6316', '191.2억원(공사비 165.8, 설계․감리․부대비 등 25.4)', 35.07480073, 129.074325, 'SRID=4326;POINT (129.074325 35.07480073)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(267, 267, '하수관로 신설(확장)공사\[수영처리구역(양정동 제척지 일원)]', 503, 1095, 1598, 100, 100, 100, 'F03', '부산진구 양정동, 연제구 연산동 일원', '2021-09-01', '2024-08-31', '오수관로(D150\~500mm), L=11.987km, 배수설비 1,130가구', 'B02', '051-888-6255', '270억원(공사 244, 기타 26)', 35.17191887, 129.0738155, 'SRID=4326;POINT (129.0738155 35.17191887)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(268, 268, '수영처리구역(수영강) 오수관로 정비사업', 847, 729, 1576, 100, 100, 100, 'F07', '수영강 일원(금정구 회동동\~부산환경공단 수영사업소)', '2021-09-23', '2023-09-22', '오수관로(D600\~1,500mm) 비굴착 전체보수 L=4.0km', 'B02', '051-888-6252', '91억원(공사 7,941 감리 747 기타 400)', 35.19963198, 129.1158433, 'SRID=4326;POINT (129.1158433 35.19963198)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(269, 269, '하수관로 확충(하단분구 BTL)', 428, 1095, 1523, 100, 100, 100, 'F07', '사하구 하단동, 괴정동, 당리동 일원', '2021-11-15', '2024-11-14', '하수관로 L=74,763m, 배수설비 N=6,280가구 등', 'B02', '051-888-6244', '773억원', 35.09959769, 128.9829928, 'SRID=4326;POINT (128.9829928 35.09959769)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(270, 270, '수영처리구역(온천천) 오수관로 정비사업 4차', 898, 607, 1505, 100, 100, 100, 'F07', '동래구, 연제구 온천천 우안 일원(연안교\~한양APT)', '2021-12-03', '2023-08-02', '오수관로(D2,000mm) 비굴착 전체보수 L=1.297km', 'B02', '051-888-6252', '106억원(공사 9,527백만원, 감리 1,078백만원)', 35.19179334, 129.0981638, 'SRID=4326;POINT (129.0981638 35.19179334)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(271, 271, '하수관로 신설(확충)사업\[동삼·청학동 일원]', 710, 2189, 1479, 16, 15.5, 103.23, 'F07', '영도구 동삼동, 청학동 일원', '2021-12-29', '2027-12-27', '하수관로(D80\~400) L=26.862Km, 배수설비 2,373개소', 'B02', '051-888-6244', '499억원', 35.07321212, 129.0723665, 'SRID=4326;POINT (129.0723665 35.07321212)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(272, 272, '벡스코 제3전시장 건립사업', 1445, 2921, 1476, 0, 0, 0, 'F05', '부산광역시 해운대구 우동 1500번지', '2022-01-01', '2029-12-31', '부지면적 24,150㎡, 연면적 58,809.97㎡, 지하1/지상4층', 'B03', '051-888-6312', '2,900억원', 35.16869326, 129.1349706, 'SRID=4326;POINT (129.1349706 35.16869326)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(273, 273, '수산식품산업 클러스터 조성사업', 1080, 2556, 1476, NULL, NULL, NULL, 'F05', '암남동 620-2외 2필지', '2022-01-01', '2028-12-31', '지하1층/지상5층, 2개동, 연면적 17,978㎡', 'B03', '888-6332', '812.62억원', 35.0623533, 129.0151424, 'SRID=4326;POINT (129.0151424 35.0623533)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(274, 274, '친환경 수소연료선박 R\&D 플랫폼 센터 건립', 952, 515, 1467, 100, 100, 100, 'F05', '남구 우암동 300번지', '2022-01-10', '2023-06-09', '부지면적 5,000㎡, 연면적 2,911.44㎡, 지상4층', 'B03', '051-888-6335', '88.47억원', 35.12129051, 129.0770389, 'SRID=4326;POINT (129.0770389 35.12129051)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(275, 275, '사상역 광역환승센터 건설공사', 312, 1148, 1460, 100, 100, 100, 'F01', '지하철 2호선 사상역 출입구 일원 및 부전-마산선 환승통로', '2022-01-17', '2025-03-10', '진출입구 개선 5개소(에스컬레이트 3개소, 엘리베이터 1개소, 무빙워크 1개소)', 'B01', '051-888-6415', '21,355백만원', 35.16218766, 128.9855594, 'SRID=4326;POINT (128.9855594 35.16218766)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(276, 276, '소방학교 야외훈련장조성사업', 595, 862, 1457, 100, 100, 100, 'F08', '금곡동 산1105-2', '2022-01-20', '2024-05-31', '야외훈련장 조성 A=13,546m2', 'B02', '051-888-6227', '9870백만원', 35.26895966, 129.0202915, 'SRID=4326;POINT (129.0202915 35.26895966)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(277, 277, '온천5호교 재가설(확장)공사', 301, 1690, 1389, 21, 22.57, 95.21, 'F01', '부산광역시 금정구 부곡동 454-23(온천5호교) 일원', '2022-03-29', '2026-11-13', '교량 재가설(확장) L=160m, B=35→50m, 접속도로 L=380m, B=35→50m', 'B01', '051-888-6415', '501억원', 35.22506568, 129.0886753, 'SRID=4326;POINT (129.0886753 35.22506568)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(278, 278, '반다비 체육센터 건립', 653, 2039, 1386, 0, 0, 0, 'F05', '부산광역시 해운대구 좌동 1404번지', '2022-04-01', '2027-10-31', '지하1/지상2층, 1개동 rn연면적 4,338.08㎡(증축) (컬링장, 체육관 등)', 'B03', '051-888-6316', '172억원', 35.18046962, 129.1765588, 'SRID=4326;POINT (129.1765588 35.18046962)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(279, 279, '돌제부두 전면 물양장 확충사업', 14, 1367, 1353, 76.4, 73.3, 104.23, 'F01', '서구 충무대로 202 일원(공동어시장 일원 전면해상)', '2022-05-04', '2026-01-30', '물양장 확충 L=100m(양측), B=80m(A=4,000㎡)', 'B01', '051-888-6205', '88.9억원', 35.08776103, 129.027367, 'SRID=4326;POINT (129.027367 35.08776103)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(280, 280, '해안새벽시장 전면 물양장 확충사업', 714, 2027, 1313, 0, 0, 0, 'F07', '부산광역시 서구 충무동1가 45', '2022-06-13', '2027-12-31', '물양장 확충 L=355m, B=4\~20m', 'B01', '051-888-6161', '26,160,000,000', 35.09339518, 129.0256426, 'SRID=4326;POINT (129.0256426 35.09339518)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(281, 281, '덕천(화명)\~양산간 도로교통체계 개선공사', 408, 1683, 1275, 60, 60, 79.37, 'F01', '부산광역시 북구 덕천동 597번지 일원', '2022-07-21', '2027-02-28', '도로개설 L=1.2㎞, B=4.5mrn(교량2개소 L=278m)', 'B01', '051-888-6184\~5', '25,109백만원', 35.22460408, 129.0051559, 'SRID=4326;POINT (129.0051559 35.22460408)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(282, 282, '부산근현대역사박물관 조성 3단계 사업', 819, 438, 1257, 100, 100, 100, 'F05', '중구 대청로 112, 대청동 1가44 일원', '2022-08-08', '2023-10-20', '구)한국은행부산본부 증축+현)부산근대역사관 외부조성rn - 구)한국은행부산본부 : 지하1층/지상5층, 연면적 6,900.37㎡(증축358.73㎡포함)rn - 현)부산근대역사관 : 지하1층/지상3층, 연면적 2,196.05㎡', 'B03', '518886317', '112.32억원', 35.10257281, 129.0318843, 'SRID=4326;POINT (129.0318843 35.10257281)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(283, 283, '학교 분류식하수관로 연결사업(북부, 동래지원청 일원)', 224, 1460, 1236, 33.5, 33.5, 100, 'F07', '북구, 동래지원청 일원', '2022-08-29', '2026-08-28', '하수관로 L=55.551kmrn배수설비 148개교', 'B02', '051-888-6252', '49,045백만원', 35.17975625, 129.0750244, 'SRID=4326;POINT (129.0750244 35.17975625)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(284, 284, '학교 분류식하수관로 연결사업(남부, 해운대지원청 일원)', 224, 1460, 1236, 36.1, 35.8, 100.84, 'F07', '남부 및 해운대지원청 일원(남구, 동구, 부산진구, 수영구. 해운대구, 기장군)', '2022-08-29', '2026-08-28', '오수관로(D80\~500mm) L=64.4km,  배수설비 145개교', 'B02', '051-888-6256', '499억원(공사 442, 감리 40, 기타17)', 35.14564494, 129.1132157, 'SRID=4326;POINT (129.1132157 35.14564494)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(285, 285, '하수관로 신설공사\[남부처리구역(광안, 남천동 일원)]', 224, 1460, 1236, 55.27, 52.07, 106.15, 'F07', '수영구 광안동, 남천동', '2022-08-29', '2026-08-28', '하수관로 신설 L=22.915km   배수설비 정비 N=1,698가구', 'B02', '051-888-6246', '480억원', 35.14863312, 129.1134247, 'SRID=4326;POINT (129.1134247 35.14863312)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(286, 286, '파워반도체 상용화센터 환경부대시설 증축공사', 1053, 173, 1226, 100, 100, 100, 'F05', '부산광역시 기장군 장안읍 임랑리 산105-2외 2', '2022-09-08', '2023-02-28', '연면적 283.03㎡, 지상 1층, 별동증축, 교육연구시설', 'B03', '051-888-6331', '19.6억원', 35.32457745, 129.2508622, 'SRID=4326;POINT (129.2508622 35.32457745)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(287, 287, '학교 분류식하수관로 연결공사(서부지원청 일원)', 254, 1459, 1205, 52.97, 52.18, 101.67, 'F07', '부산광역시 중구, 서구, 영도구, 사하구 일원', '2022-09-29', '2026-09-27', '오수관로 L=41.650km, 배수설비 84개교', 'B02', '051-888-6245', '49,860백만원', 35.07972103, 129.0732766, 'SRID=4326;POINT (129.0732766 35.07972103)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(288, 288, '태풍 힌남노 피해 남항 항만시설물 응급복구공사', 1012, 160, 1172, 100, 100, 100, 'F08', '부산광역시 서구 충무동1가 45', '2022-11-01', '2023-04-10', '계류시설(콘크리트블록) 복구 L=52m', 'B01', '051-888-6161', '950000000', 35.0945879, 129.0254528, 'SRID=4326;POINT (129.0254528 35.0945879)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(289, 289, '동천 지방하천 정비사업', 656, 467, 1123, 100, 100, 100, 'F08', '동천 자성대노인복지관 하구교 일원', '2022-12-20', '2024-03-31', '보도교 재가설 L=48m, B=3.5m, 홍수방어벽 설치 L=269m', 'B01', NULL, '3100백만원', 35.13594418, 129.0653989, 'SRID=4326;POINT (129.0653989 35.13594418)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(290, 290, '노후하수관로정비사업3-1단계(신시가처리분구 일원)', 527, 590, 1117, 100, 100, 100, 'F07', '해운대구 장산역 일원', '2022-12-26', '2024-08-07', '노후하수관로(D250\~900mm) 정비 L=4.1kmrn', 'B02', '051-888-6246', '7520백만원', 35.1694229, 129.1759899, 'SRID=4326;POINT (129.1759899 35.1694229)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(291, 291, '민주공원 부속건물 건립공사', 398, 715, 1113, 100, 100, 100, 'F05', '부산광역시 서구 동대신동2가 99-13번지 외 4필지', '2022-12-30', '2024-12-14', '부지면적 3,582㎡, 연면적 2,191.1㎡, 지하2층/지상3층', 'B03', '051-888-6312', '158억원', 35.11027885, 129.0269816, 'SRID=4326;POINT (129.0269816 35.11027885)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(292, 292, '광안대교 접속도로 연결공사', 12, 1094, 1106, 86.2, 86.2, 100, 'F01', '벡스코 요금소 \~ 센텀시티 지하차도 연결', '2023-01-06', '2026-01-04', 'RAMP교 L=276m, B=6.5m(1차로)rnUNDER-PASS L=284m, B=5∼16m(1∼4차로)', 'B01', '051-888-6181', '41,217백만원', 35.16444598, 129.132577, 'SRID=4326;POINT (129.132577 35.16444598)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(293, 293, '수영강 휴먼브리지 조성', 32, 1134, 1102, 87, 90.3, 96.35, 'F01', '해운대구 영화의 전당\~수영구 현대, 협성 아파트 일원', '2023-01-10', '2026-02-17', '보행 전용교(L=254m, B=4\~20m) 설치', 'B01', '051-888-6411', '276억원', 35.1699291, 129.1241382, 'SRID=4326;POINT (129.1241382 35.1699291)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(294, 294, '탄성소재연구소 건립', 349, 1429, 1080, 30, 30, 100, 'F05', '부산광역시 사상구 삼락동 380-17번지', '2023-02-01', '2026-12-31', '연면적 3,757.11㎡, 지하1/지상5층(연구실, 장비실 등)', 'B03', '051-888-6316', '342.42억원', 35.18119197, 128.9784919, 'SRID=4326;POINT (128.9784919 35.18119197)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(295, 295, '하수관로 신설(확충)사업\[수영처리구역(거제,연산동 일원)]', 485, 1460, 975, 26.38, 22.68, 116.31, 'F03', '부산광역시 연제구 거제동, 연산동 일원', '2023-05-17', '2027-05-16', '오수관로 신설(D80\~250㎜) 19.58㎞, 배수설비 N=2,046가구rn', 'B02', '051-888-6256', '47,529백만원', 35.18596847, 129.0816587, 'SRID=4326;POINT (129.0816587 35.18596847)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(296, 296, '중앙대로 확장공사', 245, 1163, 918, 51, 53.7, 94.97, 'F01', '동래구 롯데백화점 앞 교차로 \~ 금정구청 앞 교차로(온천5호교 구간 540m 제외)', '2023-07-13', '2026-09-18', '도로확장 L=3,270m, B=35 -> 50m 등', 'B01', '051-888-6182', '362,635백만원', 35.22241137, 129.0868721, 'SRID=4326;POINT (129.0868721 35.22241137)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(297, 297, '기장하수처리구역 분류식 관로 정비사업', 349, 1200, 851, 44.08, 46.38, 95.04, 'F03', '부산광역시 기장군 기장읍 일원', '2023-09-18', '2026-12-31', '오수관로 신설 L=3,759m, 노후하수관로 정비 L=3,614m, 배수설비 N=1,822가구', 'B02', '051-888-6256', '24,310백만원', 35.24441151, 129.2188542, 'SRID=4326;POINT (129.2188542 35.24441151)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(298, 298, '어린이대공원 진입광장 정비사업(통합관리센터 건립)', 381, 407, 788, 100, 100, 10, 'F05', '부산진구 초읍동 43번지(어린이대공원) 내', '2023-11-20', '2024-12-31', '1개동, 지하1/지상1층, 연면적 499.69㎡, 제1종 근린생활시설(공공업무시설)', 'B03', '518886317', '22억원', 35.18283973, 129.0463447, 'SRID=4326;POINT (129.0463447 35.18283973)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(299, 299, '낙동강 하굿둑 상류 대저수문 등 개선사업', 295, 1060, 765, 22.5, 43.3, 51.96, 'F08', '부산시 강서구 대저1동 1-6번지(대저수문 일원)', '2023-12-13', '2026-11-07', '대저수문(취수문, 통선문) 개선 1식', 'B01', '051-888-6422', '310억원', 35.23258072, 128.9936221, 'SRID=4326;POINT (128.9936221 35.23258072)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(300, 300, '하수관로 신설(확충)사업(연산처리분구 잔여지 일원)', 708, 1460, 752, 18.2, 15.3, 118.95, 'F03', '부산광역시 연제구 연산동, 수영구 망미동 일원', '2023-12-26', '2027-12-25', '오수관로 신설(D80\~250㎜) 22.296㎞, 배수설비 N=3,383가구', 'B02', '051-888-6254', '48,676백만원', 35.17310821, 129.0968494, 'SRID=4326;POINT (129.0968494 35.17310821)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(301, 301, '하수관로 신설(확충)사업(해동초등학교 일원)', 708, 1460, 752, 24.59, 23, 106.91, 'F03', '부산광역시 해운대구 우1동주민센터, 해동초등학교, 해운대 및 송정제척지 일원', '2023-12-26', '2027-12-25', '오수관로(D80\~250㎜) 14.549㎞, 배수설비 N=1,221가구', 'B02', '051-888-6251', '34,537백만원', 35.16443178, 129.1658709, 'SRID=4326;POINT (129.1658709 35.16443178)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(302, 302, '하수관로 신설(확충)사업(반송동 일원)', 1074, 1826, 752, 14, 14.5, 96.55, 'F07', '해운대구 반송동 일원', '2023-12-26', '2028-12-25', '오수관로 L=18.246km, 배수설비 N=3,326가구', 'B02', '051-888-6251', '49,062백만원', 35.22463939, 129.1490428, 'SRID=4326;POINT (129.1490428 35.22463939)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(303, 303, '하수관로 신설(확충) 사업\[반여,재송동 일원]', 708, 1460, 752, 39.22, 40.97, 95.73, 'F07', '해운대구 반여2동, 재송2동 일원', '2023-12-26', '2027-12-25', '하수관로 신설(D80\~300) L=9,956mrn배수설비 정비 1,282가구rn맨홀펌프장 신설 1개소', 'B02', '051-888-6225', '25,831백만원', 35.19490691, 129.1304036, 'SRID=4326;POINT (129.1304036 35.19490691)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(304, 304, '하수관로 신설(확충)사업(재송처리분구 잔여지 일원)', 708, 1460, 752, 21, 21.36, 98.31, 'F07', '해운대구 재송1,2동 및 우2동 일원', '2023-12-26', '2027-12-25', '하수관로(D80\~300㎜) L=22.064㎞, 배수설비 1,925가구', 'B02', '051-888-6225', '42,866백만원', 35.18861026, 129.1256563, 'SRID=4326;POINT (129.1256563 35.18861026)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(305, 305, '하수관로 신설(확충)사업(온천천수계 잔여지 일원)', 711, 1460, 749, 14, 14.3, 97.9, 'F03', '부산광역시 금정구 구서동, 부곡동 일원', '2023-12-29', '2027-12-28', '오수관로(D80\~250㎜) 21.09㎞, 배수설비 N=1,721가구', 'B02', '051-888-6255', '44,694백만원', 35.25410254, 129.0875196, 'SRID=4326;POINT (129.0875196 35.25410254)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(306, 306, '하수관로 신설(확충)사업\[대교사거리 일원]', 558, 1307, 749, 13.44, 13.33, 100.83, 'F07', '영도구 대교사거리(남항, 영선, 봉래동) 일원', '2023-12-29', '2027-07-28', '하수관로(D80\~250mm)  L=24.149Km, 배수설비 N=2,373개소', 'B02', '051-888-6244', '499억원', 35.09020908, 129.0372295, 'SRID=4326;POINT (129.0372295 35.09020908)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(307, 307, '부산마리나 비즈센터 건립공사', 126, 851, 725, 65, 65, 100, 'F05', '남구 우암동  303번지', '2024-01-22', '2026-05-22', '부지면적 20,158㎡, 연면적 9,116㎡, 지상4층, 2개동', 'B03', '051-888-6338', '446억원(공사 및 장비도입비 431, 설계 및 감리비 등 42)', 35.12269021, 129.0689689, 'SRID=4326;POINT (129.0689689 35.12269021)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(308, 308, '영화의전당 어린이복합문화공간 조성사업', 553, 130, 683, 100, 100, 100, 'F08', '해운대구 수영강변대로 120, 영화의전당 비프힐 1층', '2024-03-04', '2024-07-12', '영상·영화를 접목한 어린이복합문화공간 조성 리모델링 공사(A=470.39㎡)', 'B03', '518886317', '20억원', 35.17091565, 129.1269734, 'SRID=4326;POINT (129.1269734 35.17091565)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(309, 309, '헬스케어 빅데이터센터 건립', 53, 602, 655, 100, 100, 100, 'F05', '부산광역시 강서구 명지동 에코델타시티 공공청사 6블록', '2024-04-01', '2025-11-24', '부지면적 5,220㎡/ 1개동/ 지상3층/ 연면적 3,157.99㎡', 'B03', '518886317', '293.45', 35.12851216, 128.9177735, 'SRID=4326;POINT (128.9177735 35.12851216)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(310, 310, '준설물 감량화시설 설치사업 2단계', 319, 974, 655, 80, 80, 100, 'F05', '사하구 을숙도대로 469', '2024-04-01', '2026-12-01', '본 사업은 하수관로 등에서 발생되는 각종 준설물을 폐기물로 처리함에 따라 경제적, 환경적 문제가 야기되어, 준설물을 분리, 선별 등 친환경적인 감량화 과정을 거쳐 재활용하고 하수처리시', 'B03', '051-888-6366', '101억원', 35.08784279, 128.9560277, 'SRID=4326;POINT (128.9560277 35.08784279)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(311, 311, '당감·개금권 보행환경 개선사업', 426, 212, 638, 100, 100, 100, 'F01', '부산진구 백양순환로 110번길 일원 외 3개소', '2024-04-18', '2024-11-16', '보도신설·정비 등 L=1.77km, B=1.7\~4.0m', 'B01', '051-888-6425', '23.5억원', 35.15915059, 129.0317491, 'SRID=4326;POINT (129.0317491 35.15915059)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(312, 312, '당감·개금권 선형공원 조성공사', 394, 218, 612, 100, 100, 100, 'F01', '부산진구 당감동 818-161번지 일원 외 1개소', '2024-05-14', '2024-12-18', '선형공원 조성 L=370m, B=10\~15m', 'B01', '888-6205', '37.5억원', 35.16289699, 129.0361879, 'SRID=4326;POINT (129.0361879 35.16289699)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(313, 313, '에코델타 첨단지식산업센터 건립', 76, 659, 583, 79.1, 73.8, 107.18, 'F05', '부산광역시 강서구 명지동 3021-3번지 일원', '2024-06-12', '2026-04-02', '- 대지면적 5,213㎡, rn- 지상5층rn- 연면적 7,134.74㎡', 'B03', '888-6334', '353.34억원', 35.13003616, 128.918281, 'SRID=4326;POINT (128.918281 35.13003616)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(314, 314, '당감·개금권 15분 자전거길 조성공사', 406, 142, 548, 100, 100, 100, 'F01', '부산진구 개금역 \~ 백양대로 \~ 당감서로', '2024-07-17', '2024-12-06', '자전거·PM 전용도로 조성 L=2.3km', 'B01', '888-6204', '19.5억원', 35.15934398, 129.0320392, 'SRID=4326;POINT (129.0320392 35.15934398)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(315, 315, '생곡 쓰레기매립장(2-2단계) 조성공사', 2386, 2919, 533, 18.25, 16.21, 112.58, 'F04', '강서구 생곡동 생곡산단로 90 일원', '2024-08-01', '2032-07-29', '쓰레기 매립 및 복토 V=1,842천㎥', 'B02', '051-888-6225', '437억원', 35.12797145, 128.874004, 'SRID=4326;POINT (128.874004 35.12797145)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(316, 316, '하수관로 신설(확충)공사 (강동처리분구 일원)', 902, 1431, 529, 9.01, 9.36, 96.26, 'F07', '강서구 강동동 일원', '2024-08-05', '2028-07-06', '하수관로(D80\~250)  L=15.267Km, 배수설비 921개소', 'B02', '051-888-6242', '292억원', 35.20579403, 128.9259687, 'SRID=4326;POINT (128.9259687 35.20579403)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(317, 317, '해양과학기술 산학연 협력센터 건립', 51, 440, 491, 97, 97, 100, 'F05', '영도구 동삼동 1163번지 일원', '2024-09-12', '2025-11-26', '- 대지면적rn- 지하1층, 지상7층rn- 연면적 (10,386 ㎡)rn- 교육연구시설(연구소)', 'B03', '888-6337', '322.51', 35.08014424, 129.0767186, 'SRID=4326;POINT (129.0767186 35.08014424)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(318, 318, '지반침하대응 노후하수관로 정비사업(3-1단계)(오수관로 2차)', 62, 540, 478, 26.3, 26.8, 98.13, 'F03', '부산시 강변, 동부 및 수영처리구역', '2024-09-25', '2026-03-19', '오수관로(D250\~1,000㎜) L=8.427km', 'B02', '051-888-6254', '98.2억원', 35.15771735, 128.9298383, 'SRID=4326;POINT (128.9298383 35.15771735)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(319, 319, '하수관로 신설(확충)공사 (가락처리분구 일원)', 1366, 1825, 459, 4.01, 4.08, 98.28, 'F07', '강서구 가락동 일원', '2024-10-14', '2029-10-13', '하수관로(D80\~250) L=22.651Km, 배수설비 1,108개소', 'B02', '051-888-6242', '497억원', 35.1969289, 128.8949753, 'SRID=4326;POINT (128.8949753 35.1969289)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(320, 320, '노후하수관로 정비사업 3-1단계(오수관로1차)', 89, 537, 448, 44.4, 45.9, 96.73, 'F07', '부산시 녹산·신호·남부·수영·중앙 처리구역 일원', '2024-10-25', '2026-04-15', '노후 하수관로 정비 L=10.457Km', 'B02', '051-888-6241', '109억원', 35.17961213, 129.0750207, 'SRID=4326;POINT (129.0750207 35.17961213)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(321, 321, '하수관로 신설(확충)사업(윗반송 일원)', 1076, 1521, 445, 8.32, 8.33, 99.88, 'F07', '부산광역시 해운대구 반송동 62-610번지 일원', '2024-10-28', '2028-12-27', '하수관로 L=19.659㎞(D80mm\~D400mm), 배수설비 2,683개소', 'B02', '051-888-6227', '474억원', 35.23166595, 129.1562626, 'SRID=4326;POINT (129.1562626 35.23166595)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(322, 322, '동천 해수도수관로 정비 및 준설공사', 165, 608, 443, 65, 60, 108.33, 'F08', '동천 광무교\~범일교 일원', '2024-10-30', '2026-06-30', 'GRP관로보수 L=575m, 하상준설 V=4,740㎥', 'B01', '051-888-6417', '5,100백만원', 35.14759102, 129.0630601, 'SRID=4326;POINT (129.0630601 35.14759102)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(323, 323, '엄궁대교 건설공사', 1461, 1855, 394, 3.69, 3.69, 100, 'F01', '강서구 대저동 \~ 사상구 엄궁동', '2024-12-18', '2030-01-16', '도로건설 rnL=2.91㎞, B=24.5\~33.5m', 'B01', '051-888-6422,051-888-6424', '3,431억원', 35.12684818, 128.9553477, 'SRID=4326;POINT (128.9553477 35.12684818)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(324, 324, '영도 수리조선 혁신기술센터 건립', 360, 745, 385, 2, 2, 100, 'F05', '영도구 대평동1가 37번지 외 1필지', '2024-12-27', '2027-01-11', '1개동, 지상 8층, 연면적 2,786.38㎡, 교육연구시설(연구소)', 'B03', '051-888-6315', '230억원', 35.09187957, 129.034349, 'SRID=4326;POINT (129.034349 35.09187957)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(325, 325, '부산노인전문제2병원 그린리모델링 사업', 156, 205, 361, 100, 100, 100, 'F05', '부산광역시 연제구 월드컵대로 359', '2025-01-20', '2025-08-13', '지하1/지상4층, 연면적 4,939.08㎡, 의료시설rn지붕 내단열 보강, 창호교체, 천장 마감재 교체 등', 'B03', '051-888-6331', '36.87억원', 35.18731986, 129.0600795, 'SRID=4326;POINT (129.0600795 35.18731986)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(326, 326, '부산 업사이클센터 건립사업 건축공사', 103, 380, 277, 16, 24, 66.67, 'F05', '서구 암남동 산89번지 일원', '2025-04-14', '2026-04-29', '연면적 809.1㎡, 지하1층/지상4층', 'B03', '051-888-6317', '44.49억원', 35.07529528, 129.0085655, 'SRID=4326;POINT (129.0085655 35.07529528)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(327, 327, '시민공원 광장부지 임시주차장 조성사업', 153, 73, 226, 100, 100, 100, 'F08', '부산광역시 시민공원 광장부지(범전동 110번지 일원)', '2025-06-04', '2025-08-16', '임시주차장 약 90면 조성', 'B02', '051-888-6227', '7억원', 35.16601962, 129.0598931, 'SRID=4326;POINT (129.0598931 35.16601962)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(328, 328, '동부중소유통공동도매물류센터 증축사업', 25, 119, 144, 50, 50, 100, 'F05', '금정구 반송로490번길 12-19', '2025-08-25', '2025-12-22', 'ㅇ 추진배경 : 동부중소유통공동도매물류센터의 이용 점포 및 물량 증가로인한, 진열공간 부족 해소와 이용 점포의 다양한 요구 충족을 위해 증축 추진, 이를 통한 물류센터 활성화 및 동네상', 'B03', '888-6337', '3.3억원', 35.21530784, 129.1165906, 'SRID=4326;POINT (129.1165906 35.21530784)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(329, 329, '부산글로벌빌리지 들락날락 조성사업', 26, 90, 116, 14, 14, 100, 'F05', '부산진구 가야대로 734', '2025-09-22', '2025-12-21', 'ㅇ 추진배경 : 부산글로벌빌리지 1층 노후 홍보관 내 디지털영어학습콘텐츠 중심 어린이복합문화공간 들락날락 조성 및 휴식과독서를 함께 즐길 수 있는 가족복합문화공간 조성rn ㅇ 위    치', 'B03', '051-888-6331', '10억원', 35.15703786, 129.0544215, 'SRID=4326;POINT (129.0544215 35.15703786)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(330, 330, '만덕초읍(아시아드)터널 주변 도로시설물 정비', 104, 181, 77, 0, 0, 0, 'F01', '북구 덕천동 함박봉로', '2025-10-31', '2026-04-30', '방음시설 정비(상부개방형→밀폐형) L=309m 등', 'B01', '888-6204', '28억원', 35.20512237, 129.0331575, 'SRID=4326;POINT (129.0331575 35.20512237)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(331, 331, '명례일반산업단지 공공폐수처리시설 (2단계) 설치사업', 714, 788, 74, 0, 0, 0, 'F03', '기장군 장안읍 명례산단 내', '2025-11-03', '2027-12-31', '폐수처리시설 Q=1,700㎥/일', 'B02', '051-888-6224', '114억원', 35.2444181, 129.2224221, 'SRID=4326;POINT (129.2224221 35.2444181)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(332, 332, '부산진해경제자유구역 북측 진입도로(장낙대교) 건설', 1780, 1817, 37, 0, 0, 0, 'F01', '강서구 생곡동 \~ 명지동 에코델타시티', '2025-12-10', '2030-12-01', '도로건설 L=1.53㎞(교량 1.02㎞), B=24.5\~27.1m(왕복 6차로)', 'B01', '051-888-6421,051-888-6425', '1,748억원', 35.12833721, 128.907162, 'SRID=4326;POINT (128.907162 35.12833721)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(333, 333, '사상 숲체험교육관 건립사업', 529, 546, 17, NULL, NULL, NULL, 'F05', '괘법동 116번지 일원(사상공원 내)', '2025-12-30', '2027-06-29', '- 위치 : 사상구 괘법동 116번지 일원(사상공원 내)rn- 규모 : 지상3층, 연면적 1,861.09㎡, 교육연구시설rn- 사업기간 : 2022\~2027rn- 2025년 12월 착공 예정', 'B03', '051-888-6334', '155', 35.16180177, 128.9914978, 'SRID=4326;POINT (128.9914978 35.16180177)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(334, 334, '부산공동어시장 현대화 사업', 1415, 1431, 16, 0, 0, 0, 'F05', '서구 충무대로 202(남부민동)', '2025-12-31', '2029-12-01', '지하1\~지상5층, 연면적 61,971', 'B03', '051-888-6334', '2,412억원', 35.09157568, 129.0223521, 'SRID=4326;POINT (129.0223521 35.09157568)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(335, 335, '에덴유원지 조성사업 솔바람 문화센터 건립', 349, 364, 15, 0, 0, 0, 'F05', '사하구 하단동 786-1번지 일원', '2026-01-01', '2026-12-31', '지상2층, 연면적 837.02㎡, 제1종 근린생활시설(카페, 어린이복합문화공간)', 'B03', '518886317', '36억원', 35.1097754, 128.9623039, 'SRID=4326;POINT (128.9623039 35.1097754)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(336, 336, 'SMR 보조기기 제작지원센터 건립', 407, 422, 15, NULL, NULL, NULL, 'F05', '강서구 미음동 1529-5번지', '2026-01-01', '2027-02-27', '연면적 2,308㎡, 지상2층rnrn-2025년 12월 공사추진 예정', 'B03', '051-888-6334', '126억원', 35.16267784, 128.8669206, 'SRID=4326;POINT (128.8669206 35.16267784)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(337, 337, '부산시민공원 지하주차장 건립', 746, 730, -16, 0, 0, 0, 'F05', '부산진구 연지동 60번지 부산시민공원 내(시민사랑채 북측)', '2026-02-01', '2028-02-01', '지하3층/지상1층, 연면적 14,480㎡, 주차장 400대', 'B03', '051-888-6315', '150억원', 35.17091398, 129.058771, 'SRID=4326;POINT (129.058771 35.17091398)'::public.geometry);

INSERT INTO test.busan\_construction

(gid, seq\_no, project\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon, geom)

VALUES(338, 338, '부산박물관 시설개선사업', 1112, 731, -381, 0, 0, 0, 'F05', '남구 유엔평화로 63 일원(부산박물관 내)', '2027-02-01', '2029-02-01', 'ㅇ 규    모 : 지하1층/지상3층, 연면적 19,207.30㎡(증축 4,196.53㎡)rn ㅇ 용    도 : 문화 및 집회시설(박물관)', 'B03', '051-888-6315', '288억원', 35.12965185, 129.0943961, 'SRID=4326;POINT (129.0943961 35.12965185)'::public.geometry);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(1, 1, '산성터널 접속도로(금샘로) 개설공사(용역)', 1842, 10226, 12068, 100, 100, 75, 'F01', '금강식물원\~부산대학교\~구서롯데캐슬 APT일원', '1993-01-01', '2020-12-31', '도로개설 L=3,550m, B=20m(4차로)rn', 'B01', '051-888-6202', '1,054억원', 35.23088107, 129.0931955);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(2, 2, '전포로\~하마정간 도로확장공사', 4278, 7425, 11703, 100, 100, 100, 'F01', '부산진구 전포로\~하마정간', '1994-01-01', '2014-05-01', '확장L=1.54km, 광장조성 A=34,740㎡', 'B01', NULL, '1850억원', 35.16765367, 129.0665958);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(3, 3, '덕천(화명)\~양산간 도로건설', 2665, 6481, 9146, 100, 100, 100, 'F01', '북구 덕천(화명)동 ～ 양산시 경계', '2001-01-01', '2018-09-30', 'L=6.8km, B=18\~38m(4\~8차로)', 'B01', '051-888-6414', '2301억원', 35.19729594, 128.9900366);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(4, 4, '명지지구 진입도로\[지하차도] 개설 공사', 3406, 5316, 8722, 100, 100, 100, 'F01', '명지', '2002-03-01', '2016-09-19', '지하차도 L=0.6㎞ B=21m, 교량 L=0.06㎞ B=38m', 'B01', '051-888-6424', '409', 35.21219795, 128.9805706);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(5, 5, '개금 건널목 지하차도 설치 ☞공사준공', 6621, 1795, 8416, 100, 100, 100, 'F01', '부산진구 개금동 개금건널목 일원', '2003-01-01', '2007-12-01', 'L=361m, B=20～28m(지하차도 179m)', 'B01', '051-888-6224', '261', 35.1559254, 129.0295401);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(6, 6, '가덕대교 건설사업', 5555, 2861, 8416, 100, 100, 100, 'F01', NULL, '2003-01-01', '2010-11-01', '교량건설 L=1,120m, B=21∼35m', 'B01', NULL, '1,340억원', 35.08783426, 128.8432847);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(7, 7, '을숙도대교 건설사업(☞공사준공)', 5890, 1795, 7685, 100, 100, 100, 'F01', '사하구 신평동(을숙도대교) \~ 구평동(장림고개)', '2005-01-01', '2009-12-01', 'L=5,2㎞, B=25.5～35m(6차로)', 'B01', '051-888-6156,051-888-6155', '4200', 35.1044479, 128.974933);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(8, 8, '생곡쓰레기매립장(2단계) 조성', 3669, 3804, 7473, 100, 100, 100, 'F04', '강서구 생곡동 산61-1번지 일원', '2005-08-01', '2015-12-31', '조성면적 69,970㎡, 쓰레기매립·복토4,939천㎥', 'B02', '051-888-6255', '430', 35.13049744, 128.8725201);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(9, 9, '하수관거신설(확충)공사\[남부처리구역(전포분구)]', 5951, 1369, 7320, 100, 100, 100, 'F03', NULL, '2006-01-01', '2009-10-01', '오수관로 D=250\~500mm L=18.788m', 'B02', NULL, '168', 35.16285537, 129.0531698);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(10, 10, '산성터널 접속도로(화명측) 건설', 2604, 4657, 7261, 100, 100, 100, 'F01', '화명현대아파트 일원', '2006-03-01', '2018-11-30', 'L=1.68㎞, B=17.9\~50m(4\~6차로)', 'B01', '051-888-6411', '1,611억원', 35.23532956, 129.0202258);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(11, 11, '산성터널 접속도로(금정측) 건설', 2106, 4849, 6955, 100, 100, 100, 'F01', '금정구 장전동 장전초교\~회동동 회동I.C', '2007-01-01', '2020-04-11', 'L=3,240m, B=4\~6차로', 'B01', '051-888-6202,051-888-6204,051-888-6205', '3,308억원', 35.23930999, 129.0924895);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(12, 12, '부산항대교(북항대교) 민간투자사업', 4279, 2586, 6865, 100, 100, 100, 'F01', '영도구 청학동 ～ 남구 감만동', '2007-04-01', '2014-04-30', 'L=3.331㎞  B=18.6\~28.7m(4～6차로)', 'B01', '051-888-6203', '5384', 35.1106216, 129.0864296);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(13, 13, '하수관거신설(확충)공사\[기장처리구역(송정분구)]', 5920, 670, 6590, 100, 100, 100, 'F03', '해운대구 송정동 일원', '2008-01-01', '2009-11-01', '하수관거 L=552m, D=250\~400mm', 'B02', NULL, '18.61억원', 35.18953929, 129.1808293);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(14, 14, '감천항\~다대포항 연결도로 건설공사', 3669, 2921, 6590, 100, 100, 100, 'F01', '사하구 다대동 국제여객길 \~ 구평동 감천항만로', '2008-01-01', '2015-12-31', '도로개설rnL=1.48㎞ B=20m(4차로)', 'B01', '888-6206', '230', 35.05611311, 128.9913822);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(15, 15, '정관산업단지 연결도로 \[예림교차로\~농공단지] 확장', 565, 6025, 6590, 100, 100, 100, 'F01', '기장군 정관농공단지\~국지도60호선 예림교차로', '2008-01-01', '2024-06-30', '도로확장 및 개설 L=1,710m, B=25m(4차로)', 'B01', '888-6425', '193.6억원', 35.32779024, 129.1877925);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(16, 16, '장안\~임랑간(국지도 60호선) 연결도로 건설', 2999, 3591, 6590, 100, 100, 100, 'F01', '기장군 장안교차로(국도14호선) \~ 임랑교차로(국도31호선)', '2008-01-01', '2017-10-31', '도로건설 L=2.5㎞ B=20\~25m(4차로)', 'B01', '051-888-6187,051-888-6184', '654억원', 35.31287636, 129.2453049);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(17, 17, '시립노인 전문병원 건립공사☞공사완료', 4399, 2191, 6590, 100, 100, 100, 'F05', '사하구 하단동 566-3번지 일원', '2008-01-01', '2013-12-31', '지하2층, 지상 2층, 연면적 6,924㎡', 'B03', NULL, '91', 35.10223224, 128.9628742);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(18, 18, '북항대교\~동명오거리간 고가.지하차도 건설', 3303, 3287, 6590, 100, 100, 100, 'F01', '남두 감만동(시선대부두)\~대연동(대연고가교)', '2008-01-01', '2016-12-31', '도로개설 L=3,040m, B=4\~8차로', 'B01', '051-888-6155,051-888-6157', '2,193억원', 35.13652979, 129.0842428);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(19, 19, '석대천(하류)생태하천 조성', 4063, 2436, 6499, 100, 100, 100, 'F06', NULL, '2008-04-01', '2014-12-02', '하천정비 L=4.94km', 'B02', NULL, '148', 35.16308836, 129.1635923);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(20, 20, '석대천(상류) 하천정비공사', 3303, 2921, 6224, 100, 100, 100, 'F06', '석대천', '2009-01-01', '2016-12-31', '하천정비 L=2.5(발주 1.97)km', 'B02', '051-888-6224', '166억원', 35.23514214, 129.1704955);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(21, 21, '수영하수처리시설 시설개선사업', 4764, 1429, 6193, 100, 100, 100, 'F03', '동래구 온천 천남로 185', '2009-02-01', '2012-12-31', '부지집약화 시설, 고도처리개선, 동부이송관거', 'B02', '051-888-4093', '1074', 35.18862952, 129.1111671);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(22, 22, 'UN평화기념관 건립공사', 4125, 1734, 5859, 100, 100, 100, 'F05', '남구 대연동 당곡공원 내', '2010-01-01', '2014-10-01', '지하2/지상3층, 8,000㎡', 'B03', NULL, '258억원', 35.1274541, 129.0958974);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(23, 23, '구포대교\~대동수문간 도로확장공사', 3213, 2646, 5859, 100, 100, 100, 'F01', '강서구 구포대교 \~ 김해시 대동면(대동수문)', '2010-01-01', '2017-03-31', '도로확장공사rnL=2.9km, B=8m → 30m(2차로→6차로)', 'B01', '051-888-6206', '842억원', 35.2139649, 128.9880057);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(24, 24, '괴정천 생태하천 조성공사', 2969, 2890, 5859, 100, 100, 100, 'F06', '사하구 괴정천 일원', '2010-01-01', '2017-11-30', '하천정비 L=671.2m, 교량재가설 L=92.2m', 'B02', '051-888-6224', '275억원', 35.10504089, 128.960836);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(25, 25, '학장천 고향의 강 조성사업(2단계)', 2514, 3345, 5859, 100, 100, 100, 'F06', '사상구 주례동 주학교 \~ 낙동강 합류부', '2010-01-01', '2019-02-28', '하천정비 L=3,150m', 'B02', '051-888-6231', '382.6억원', 35.14243529, 128.9865715);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(26, 26, '동삼혁신지구 친수호안 조성공사', 4339, 1461, 5800, 100, 100, 100, 'F06', '영도구 동삼혁신지구 전면해안', '2010-03-01', '2014-03-01', '친수호안 L=771m', 'B02', NULL, '264', 35.09123989, 129.0678888);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(27, 27, '해포분교 해양레포츠스쿨 조성☞공사준공 완료', 4764, 1036, 5800, 100, 100, 100, 'F05', '강서구 봉림동 738-1714 외', '2010-03-01', '2012-12-31', '부지면적 9,045㎡, 연면적2,561.79㎡ 지상1층 증축', 'B03', NULL, '19', 35.21219795, 128.9805706);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(28, 28, '부산남항 남항동 호안정비공사', 4520, 1219, 5739, 100, 100, 100, 'F06', '영도구 남항동 방파호안 전면수역', '2010-05-01', '2013-09-01', '호안정비 L=854m', 'B02', NULL, '183', 35.08540798, 129.0376363);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(29, 29, '사하구 강변도로 확장', 2938, 2788, 5726, 100, 100, 100, 'F01', '사하구 시평동 66호광장 다대동 (주)대아선재', '2010-05-14', '2017-12-31', '도로확장 L=3,800m,B=25→31m,도로정비L=400m,B=30m', 'B01', '051-888-6417', '336억원', 35.07960834, 128.950843);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(30, 30, '하수관거신설(확충)공사\[장림처리구역(만덕분구)]', 4064, 1644, 5708, 100, 100, 100, 'F03', '부산광역시 북구 만덕 1,2,3동 일원', '2010-06-01', '2014-12-01', '하수관거(D=150\~500㎜), L=13.117㎞', 'B02', NULL, '144', 35.20975429, 129.0320871);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(31, 31, '하수관거신설확충\[장림처리구역(대리천일원)]', 3469, 2239, 5708, 100, 100, 100, 'F03', '부산광역시 북구 구포동 일원', '2010-06-01', '2016-07-18', '하수관거(D=80\~300㎜), L=20.265㎞', 'B02', '888-6257', '177.55', 35.19729594, 128.9900366);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(32, 32, '하수관거신설(확충)공사\[남부처리구역(가야처리분구일원)]', 3244, 2464, 5708, 100, 100, 100, 'F07', '부산광역시 부산진구 가야동, 개금동일원', '2010-06-01', '2017-02-28', '하수관거(D50\~500mm) L=11.817kmrn배수설비 N = 2,284개소', 'B02', '051-888-6236', '18,593백만원', 35.1525726, 129.0317172);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(33, 33, '하수슬러지 육상처리시설', 4916, 731, 5647, 100, 100, 100, 'F05', '강서구 생곡동 135-94번지 일원', '2010-08-01', '2012-08-01', '육상처리시설 550톤/일', 'B03', NULL, '750억원', 35.12815166, 128.8751709);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(34, 34, '생활폐기물 연료화 및 전용보일러 설치사업', 4673, 913, 5586, 100, 100, 100, 'F05', '강서구 생곡동', '2010-10-01', '2013-04-01', '부지면적 98,000㎡, 연면적 30,501㎡', 'B03', NULL, '1806억원', 35.13414803, 128.8882972);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(35, 35, '용호만 유람선 터미널 조성공사☞공사완료', 4673, 913, 5586, 100, 100, 100, 'F05', '-', '2010-10-01', '2013-04-01', '유람선 터미널 조성공사(지상3층, 연면적 1,903㎡)', 'B03', '051-888-6235', '59', 35.18004449, 129.0750317);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(36, 36, '녹산통합오수관로 설치 공사', 4612, 943, 5555, 100, 100, 100, 'F03', '강서구 녹산동 일원', '2010-11-01', '2013-06-01', '통합오수관로(D=500\~1,350mm) L=12.156㎞', 'B02', NULL, '448억원', 35.1246672, 128.8603486);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(37, 37, '부산항대교 영도연결도로 건설공사', 3852, 1673, 5525, 100, 100, 100, 'F01', '영도구 영선동\~청학동', '2010-12-01', '2015-07-01', 'L=2.44km, B=19\~60m(4\~6차로)', 'B01', NULL, '3,137억원', 35.09671175, 129.0598473);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(38, 38, '부산항대교\~동명오거리간 고가·지하차도건설', 3303, 2195, 5498, 100, 100, 100, 'F01', '부산광역시 남구 동명오거리', '2010-12-28', '2016-12-31', 'L=3.04km,   B=18.6\~41.5m(4\~8차로)', 'B01', '051-888-6155', '2193억원', 35.12108066, 129.0986296);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(39, 39, '반송로(동천교\~석대쓰레기매립장)확장공사', 1112, 4382, 5494, 100, 100, 100, 'F01', '금정구 금사동 동천교 \~ 해운대구 석대쓰레기 매립장', '2011-01-01', '2022-12-31', '도로확장 L=930m, B=25->29\~35m(4\~6차로)', 'B01', '051-888-6201', '17,900백만원', 35.22032268, 129.1199384);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(40, 40, '학리항 정비공사', 4125, 1369, 5494, 100, 100, 100, 'F06', NULL, '2011-01-01', '2014-10-01', '방파제설치 L=70m', 'B02', NULL, '64', 35.25766125, 129.247955);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(41, 41, '금성동 오수관로 설치공사', 3616, 1878, 5494, 100, 100, 100, 'F03', '금정구 금성동\~북구 화명동 일원', '2011-01-01', '2016-02-22', '오수관로 설치 L=4.3㎞(D=250\~300mm)', 'B02', '051-888-6236', '44.8억원', 35.24277705, 129.0921041);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(42, 42, '금정시내버스 공영 차고지 조성사업', 3700, 1794, 5494, 100, 100, 100, 'F02', '금정구 노포동 227번지 일원', '2011-01-01', '2015-11-30', '차고지조성 A=28,399㎡', 'B02', '051-888-6253', '210', 35.28955424, 129.0989259);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(43, 43, '명례일반산업단지 진입도로 건설공사', 4155, 1249, 5404, 100, 100, 100, 'F01', '기장군 장안읍 기룡리\~명례리', '2011-04-01', '2014-09-01', 'L=2.44km B=18.5→35m(4→6차로)', 'B01', NULL, '254', 35.36302968, 129.2627978);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(44, 44, '명례일반산업단지 폐수종말처리시설 건설', 4429, 975, 5404, 100, 100, 100, 'F03', '기장군 장안면 명례산단 내', '2011-04-01', '2013-12-01', '1단계(처리용량 Q=1,600톤/일)', 'B02', NULL, '90', 35.36982302, 129.2647697);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(45, 45, '사상 광장로 녹화사업', 4732, 642, 5374, 100, 100, 100, 'F06', '사상구 괘법동 광장로(괘법교\~애플아울렛)', '2011-05-01', '2013-02-01', 'L=0.7km, B=30m', 'B02', NULL, '45억원', 35.16396007, 128.9785791);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(46, 46, '부산 미디어아트벙커 조성', 4429, 914, 5343, 100, 100, 100, 'F05', '수영구 광안동 산63-2', '2011-06-01', '2013-12-01', '지하1층, 연면적 3,693㎡', 'B03', NULL, '27', 35.14921263, 129.1060227);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(47, 47, '센텀 119안전센터 신축공사', 4612, 670, 5282, 100, 100, 100, 'F05', '해운대구 우동 1481번지', '2011-08-01', '2013-06-01', '지상3층, 연면적 1,500㎡', 'B03', NULL, '32', 35.17336235, 129.1308125);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(48, 48, '덕천천 생태하천 정비사업', 4125, 1096, 5221, 100, 100, 100, 'F06', '북구 만덕동\~구포동 일원', '2011-10-01', '2014-10-01', '진입도로L=550m, 접근교량 L=290m', 'B02', NULL, '126억원', 35.21020056, 129.0031545);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(49, 49, '구포대교\~대동수문간 도로확장공사(2공구)', 3244, 1965, 5209, 100, 100, 100, 'F01', '강서구 구포대교 \~ 김해시 대동면(대동수문)', '2011-10-13', '2017-02-28', '도로확장공사rnL=2.72km, B=8m → 30m', 'B01', '051-888-6206', '23,619백만원', 35.21437783, 128.9881037);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(50, 50, '하수관거 신설(확충)공사\[남부처리구역(광안동일원)]', 2787, 2373, 5160, 100, 100, 100, 'F03', '수영구 광안동 일원', '2011-12-01', '2018-05-31', '관거(D=200～450mm) L=18.056㎞, 배수설비 2,817가구', 'B02', '051-888-6259', '299억원', 35.14553823, 129.113134);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(51, 51, '해운대수목원 조성사업', 1445, 6585, 5140, 83, 83, 100, 'F06', '해운대구 석대동 24번지 일원', '2011-12-21', '2029-12-31', 'A=633,671㎡ rn0 1단계 : 부분 준공(2011. 12월 \~ 2017. 5월) 및 임시개장(2021. 5월), 치유의 숲 지구, A = 414,864㎡rn0 2단계 : 공사 진행 중(2016. 12월 \~ 2029. 12월, 예정), 도시생활 숲 지구,  A =218,807㎡', 'B02', '051-888-6295', '1,213억원(공사 660, 보상 489, 기타 64)', 35.23031372, 129.1318839);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(52, 52, '다사랑 복합문화예술회관 건립☞공사완료', 3975, 1154, 5129, 100, 100, 100, 'F05', '부산진구 대학로 62 일원', '2012-01-01', '2015-02-28', '부지 2,358㎡, 1개동, 연면적 4,043㎡', 'B03', '051-550-4580', '103', 35.15122907, 129.0344487);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(53, 53, '하수처리장 노후기자재 교체 및 시설보강☞공사완료', 4673, 456, 5129, 100, 100, 100, 'F03', '남구 용호동 남부하수처리장 등', '2012-01-01', '2013-04-01', '농축기교체, 하수찌꺼기 호퍼증설 등', 'B03', NULL, '6', 35.11704069, 129.1153719);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(54, 54, '장애인종합회관 확보사업☞공사완료', 4613, 516, 5129, 100, 100, 100, 'F05', '동구 초량동 1203-2', '2012-01-01', '2013-05-31', '연면적 4,965㎡', 'B03', '051-888-4333', '7', 35.1142837, 129.0407241);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(55, 55, '구덕민속예술관 리모델링 및 증축☞공사완료', 4035, 1094, 5129, 100, 100, 100, 'F05', '동서구 서대신동3가 산2-3번지 일원', '2012-01-01', '2014-12-30', '부지 2,611㎡, 연면적 693.21㎡', 'B03', NULL, '7', 35.11231237, 129.0120291);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(56, 56, '검역계류장 이전사업 진입도로', 3791, 1338, 5129, 100, 100, 100, 'F01', '부산광역시 강서구 지사동 산133-1번지 일원', '2012-01-01', '2015-08-31', '농림축산검역본부 영남지역본부 검역계류장rn이전부지 진입도로 건설rn진입도로 L=350m(교량 76m, 도로 274m), B=12m', 'B01', '051-888-6411', '46', 35.14431721, 128.8113354);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(57, 57, '수영강 하류 생태하천 복원(3차)', 3318, 1811, 5129, 100, 100, 100, 'F06', '금정구 회동수원지(댐) 방류구 \~ 동천교', '2012-01-01', '2016-12-16', '생태하천 복원 및 친수공간 시민생활 환경개선rn하천정비 L=2.8km, B=50\~140m', 'B02', '051-888-6227', '14.7억원', 35.22641602, 129.1208744);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(58, 58, '금강공원 재정비 사업', 1080, 6209, 5129, 1, 1, 100, 'F05', '부산시 동래구 온천동 금강공원일원', '2012-01-01', '2028-12-31', 'A=400,000㎡', 'B02', '051-888-6291', '1,891억원', 35.22148827, 129.0724187);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(59, 59, '부산박물관 수장고 건립사업☞공사완료', 3944, 1125, 5069, 100, 100, 100, 'F05', '남구 유엔평화로 63 부산박물관', '2012-03-01', '2015-03-31', '지하1, 지상2, 연면적 3,127㎡', 'B03', '888-6310', '96', 35.12952167, 129.0941075);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(60, 60, '감전유수지 다기능 저류시설 설치', 2969, 2039, 5008, 100, 100, 100, 'F03', '사상구 괘법동 감전유수지 일원', '2012-05-01', '2017-11-30', '저류시설 V=17,400㎥ 도수로 L=1,321m 등', 'B02', '051-888-6232', '290억원', 35.16275491, 128.9762234);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(61, 61, '노포동 화물차 공영 차고지 조성사업 - 공사준공', 3303, 1674, 4977, 100, 100, 100, 'F08', '부산시 금정구 노포동 108-2번지 일원(노포I.C 인근)', '2012-06-01', '2016-12-31', '차고지 조성 43,093㎡, 주차334면, 건축 1,810㎡', 'B02', '051)888-6258', '269', 35.28451915, 129.1013895);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(62, 62, '수영강하류 생태하천 조성사업', 4583, 394, 4977, 100, 100, 100, 'F06', '해운대구 재송동 좌수영교 옆', '2012-06-01', '2013-06-30', '보행.자전거램프 및 승강기 1기', 'B02', '051-888-4093', '17', 35.17483315, 129.1209513);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(63, 63, '황령산 봉수대 관광자원화 사업', 4490, 457, 4947, 100, 100, 100, 'F06', '연제구 황령산 일원', '2012-07-01', '2013-10-01', '진입로 개설 및 주차장 설치 등', 'B02', NULL, '12', 35.16359905, 129.082866);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(64, 64, '산성터널접속도로(화명측) 건설공사 (3공구)', 2604, 2334, 4938, 100, 100, 100, 'F01', '화명현대아파트 일원', '2012-07-10', '2018-11-30', '지하차도 L=604m, 평면도로 L=476m, B=27\~50m', 'B01', '051-888-6411', '739억원', 35.23554392, 129.0203409);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(65, 65, '군 수영부두 대체시설 건립', 3213, 1703, 4916, 100, 100, 100, 'F05', NULL, '2012-08-01', '2017-03-31', '소선박부두, 통합막사, 해상경계시설, 정비고, 이동식방호초소 등', 'B02', '051-888-6259', '220.7억원', 35.12015574, 129.0717345);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(66, 66, '천마터널 건설(민자)', 2483, 2357, 4840, 100, 100, 100, 'F01', '사하구 구평동\~서구 암남동', '2012-10-16', '2019-03-31', '도로개설 L=3.28㎞, B=왕복4차로(자동차전용도로 : 19\~46m)rn▷ 터널 L=1.51㎞, 지하차도 L=1.17㎞, 교량 등 L=0.63㎞', 'B01', '051-888-6184,051-888-6181', '3,065억원(민자포함)', 35.08015928, 129.0217194);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(67, 67, '강변하수처리장 여과설비 및 탈수기 증설☞공사완료', 4673, 151, 4824, 100, 100, 100, 'F03', '사하구 을숙도대로 466(강변하수처리장내)', '2012-11-01', '2013-04-01', '여과설비 증설 8대, 원심탈수기 증설 등 1식', 'B03', NULL, '35', 35.08381018, 128.9562932);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(68, 68, '녹산하수처리장 미설치 기계설비 설치공사', 4521, 303, 4824, 100, 100, 100, 'F03', '강서구 녹산산단 382로 49번길 39', '2012-11-01', '2013-08-31', '생물반응조, 최종침전지, 자외선살균 설비 등', 'B03', NULL, '35', 35.08411583, 128.8636811);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(69, 69, '회동동 화물차 공영 차고지 조성사업', 3730, 1094, 4824, 100, 100, 100, 'F02', '금정구 회동동 28번지 일원', '2012-11-01', '2015-10-31', '차고지 조성 A=80,149㎡, 도로개설 L=603, B=8.0m', 'B02', '051-888-6253', '430', 35.23624941, 129.1335769);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(70, 70, '부산 중앙광장 조성사업', 4248, 576, 4824, 100, 100, 100, 'F06', '부산진구 부암1동 41-2번지 일원', '2012-11-01', '2014-05-31', '광장조성 A=34,740㎡rn- PC BOX설치 L=164Mrn- 선큰 근린생활시설 지하1층rn- 공공화장실 지상1층', 'B02', '051-888-4093', '241', 35.16614861, 129.0517645);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(71, 71, '부산지식산업센터 건립공사☞공사완료', 3395, 1399, 4794, 100, 100, 100, 'F05', '북구 금곡동 812-8번지', '2012-12-01', '2016-09-30', '○ 사업개요rn- 위치 : 북구 금곡동 812번지(조달청 비축기지 내)rn- 규모 : 지하1/지상6층, 연면적 16,226.86㎡(부지면적 9,900㎡)rn- 사업비 : 300억원rn- 사업기간 : 2013 \~ 2016. 8.', 'B03', '051-888-6316', '300', 35.25597944, 129.0129379);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(72, 72, '자원순환시설 건립☞공사완료', 3671, 1092, 4763, 100, 100, 100, 'F05', '자원순환특화단지(생곡)', '2013-01-01', '2015-12-29', '부지 8,250㎡, 2개동, 연면적 4,278㎡', 'B03', '051-888-6331', '223', 35.13494533, 128.8868675);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(73, 73, '부산민속예술관 증.개축☞공사완료', 3592, 1171, 4763, 100, 100, 100, 'F05', '동래구 우장춘로 195번길 46(온천동, 금강공원내)', '2013-01-01', '2016-03-17', '노후(’74년도 건립)되고 협소한 부산민속예술관을 개축하여 쾌적한 시설로 개선rn부지면적 3,260㎡, 연면적 1,666㎡, 지상3층', 'B03', '051-888-6334', '45', 35.21902797, 129.0750575);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(74, 74, '시립미술관 내 전시관 건립☞공사완료', 4033, 730, 4763, 100, 100, 100, 'F05', '해운대구 APEC로 58(우동)', '2013-01-01', '2015-01-01', '한국을 대표하는 세계적 현대미술 작가인 이우환 화백의 기증 작품을 전시 할 수 있는 명품 전시관 건립rn연면적 1,400㎡, 지하1층/지상2층', 'B03', '051-888-4254', '47', 35.1665484, 129.1370216);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(75, 75, '황령산 봉수대 주변 조망쉼터 조성☞공사완료', 3975, 788, 4763, 100, 100, 100, 'F05', '남구 대연동 산53-1번지 일원 약 950㎡', '2013-01-01', '2015-02-28', '도심속 유원지로 관광객이 즐겨찾는 황령산봉수대 주변 조망쉼터 조성 rn연면적 약 276㎡, 지하1층', 'B03', '051-888-4225', '11', 35.15622468, 129.0840825);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(76, 76, '수영하수처리장 노후 슬러지수집기 교체☞공사완료', 4278, 485, 4763, 100, 100, 100, 'F05', '동래구 온천천 남로 185번지(수영하수처리장내)', '2013-01-01', '2014-05-01', '내구연한 경과 등 노후된 기자재 교체로 하수처리효율 향상rn노후 슬러지수집기 교체 ▷ 종침 4지 16대(2수로 1구동)', 'B03', '051-500-2153', '12', 35.18752106, 129.1127191);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(77, 77, '강변하수처리장 셍물반응조 산기관 교체☞공사완료', 4218, 545, 4763, 100, 100, 100, 'F05', '사하구 을숙도대로 466번지(강변하수처리장내)', '2013-01-01', '2014-06-30', '내구연한 경과 등 노후된 기자재 교체로 하수처리효율향상rn생물반응조 노후 산기관 4,468개 교체', 'B03', NULL, '12', 35.1044479, 128.974933);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(78, 78, '감전분구 하수관거정비(BTL)', 3700, 1032, 4732, 100, 100, 100, 'F03', '사상구 및 진구(개금동)일원', '2013-02-01', '2015-11-30', '하수관거=119㎞, 배수설비=8,017개소', 'B02', '051-888-6253', '605', 35.15261203, 128.9911421);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(79, 79, '하수관거신설(확충)공사\[수영처리구역(반여동일원)]', 3017, 1702, 4719, 100, 100, 100, 'F03', '해운대구 반여동, 금정구 금사동 일원', '2013-02-14', '2017-10-13', '관서(D=80\~500mm) 31,849㎞, 배수설비 2,409가구', 'B02', '051-888-6261', '396억원', 35.20624865, 129.1311227);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(80, 80, '남부공공하수처리시설 시설개선공사', 3152, 1491, 4643, 100, 100, 100, 'F03', '남구 용호동 29번지 일원', '2013-05-01', '2017-05-31', '신설처리시설 65,000톤/일, 기존시설개량: 275,000톤', 'B02', '051-888-6222', '1161억원', 35.12668753, 129.1161479);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(81, 81, '남부하수처리시설 시설개선', 3152, 1491, 4643, 100, 100, 100, 'F03', '남구 용호동 이기대공원로 11(남부하수처리장 내)', '2013-05-01', '2017-05-31', '처리시설 신설 65,000톤/일, 기존시설 개량 275,000톤/일', 'B02', '051-888-6222', '1,161억원', 35.1315784, 129.1188633);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(82, 82, '전포천 하천정비공사', 4248, 334, 4582, 100, 100, 100, 'F06', '부산진구 번전동(동해남부선)일원', '2013-07-01', '2014-05-31', '하천정비 L=184m', 'B02', NULL, '22', 35.16285537, 129.0531698);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(83, 83, '하수관거신설(확충)공사\[남부처리구역(부산진구일원)]', 2907, 1636, 4543, 100, 100, 100, 'F03', '부산광역시 부산진구 개금동, 당감동, 부암동 일원', '2013-08-09', '2018-01-31', '관거 (D80\~600m) L=14.55km, 배수설비 N=868가구', 'B02', '051-888-6237', '188억원', 35.16774814, 129.0370881);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(84, 84, '산성터널 건설(민자)', 2665, 1856, 4521, 100, 100, 100, 'F01', '북구 화명동\~금정구 장전동', '2013-08-31', '2018-09-30', 'L=5.62km, B= 27m\~42.4m(4차로)', 'B01', '051-888-6155', '3004억원', 35.24163075, 129.0238751);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(85, 85, '하수관거 확충(개금.주례일원)', 2859, 1539, 4398, 100, 100, 100, 'F03', '부산광역시 부산진구 개금동,사상구 주례동 일동', '2014-01-01', '2018-03-20', '관거L=16.3km, 배수설비, 1,277가구', 'B02', '051-888-6254', '17,251백만원', 35.15424209, 128.9996308);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(86, 86, '하수관거 정비(삼락.덕천, BTL)', 3456, 942, 4398, 100, 100, 100, 'F03', '사상구 삼락, 덕천동 일원', '2014-01-01', '2016-07-31', '낙동강 등 지천 수질 개선 및 쾌적한 생활환경 제공rn관거(D=80\~600㎜) L= 112.4km, 맨홀펌프장 6개소', 'B02', '051-888-6251', '575', 35.16570435, 128.9744072);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(87, 87, '구 충무시설 보수정비 리모델링☞공사완료', 4248, 150, 4398, 100, 100, 100, 'F05', '수영구 수영로 521번길(광안동), 舊 충무시설', '2014-01-01', '2014-05-31', '인공동굴구조의 특수성을 이용 미디어아트 공간 조성rn연면적 3,740㎡, 지하1층', 'B03', '051-888-4284', '6', 35.14917294, 129.1083038);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(88, 88, '차집시설 개량 및 통합관리시스템 구축', 2938, 1460, 4398, 100, 100, 100, 'F03', '부산광역시 일원', '2014-01-01', '2017-12-31', '차집시설정비 N=894개소, 통합관리시스템 1식', 'B02', '051-888-6225,051-888-6223', '274억원', 35.17662979, 129.0765693);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(89, 89, '하수처리장 노후시설 개선', 3853, 545, 4398, 100, 100, 100, 'F03', '동래구 온천천남로 185 수영하수처리장 등 7개소', '2014-01-01', '2015-06-30', '노후 슬러지수집기교체 등 7개소', 'B03', '051-500-2153', '76', 35.18736162, 129.1135931);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(90, 90, '반룡일반산업단지 진입도로 건설', 3262, 1136, 4398, 100, 100, 100, 'F01', '기장군 장안읍 국도14호선 \~ 반룡일반산업단지', '2014-01-01', '2017-02-10', 'L=342m B=15m(3차로)', 'B01', '051-888-6425', '68억원', 35.350849, 129.2491715);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(91, 91, '도심대형 재래시장 분류식 하수관로 설치', 3244, 1154, 4398, 100, 100, 100, 'F03', '부산진구 부전 \* 서면시장', '2014-01-01', '2017-02-28', '오수관로설치 L=8,127km, 배수설비 N= 1,046 개소', 'B02', '051-888-6265', '147', 35.16285537, 129.0531698);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(92, 92, '대저119안전센터 건립공사☞공사완료', 3700, 698, 4398, 100, 100, 100, 'F05', '부산광역시 강서구 대저1동 684-7번지', '2014-01-01', '2015-11-30', '○ 사업개요rn- 위   치 : 강서구 대저1동 684-2번지rn- 규   모 : 지상3층, 연면적 754.97㎡rn- 사업비 : 16.84억원rn- 사업기간 : 2014 \~ 2015. 11.', 'B03', '051-888-6314', '16.84', 35.21634442, 128.9725585);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(93, 93, '부산글로벌테크비즈센터 건립 공사☞공사완료', 2696, 1702, 4398, 100, 100, 100, 'F05', '강서구 미음R\&D허브단지 내 (미음동 1522-1)', '2014-01-01', '2018-08-30', '지상 9층, 연면적 12,956.54㎡rn', 'B03', '051-888-6315', '281억원', 35.16221636, 128.8670417);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(94, 94, '첨단 표면처리 센터 건립☞공사완료', 2818, 1580, 4398, 100, 100, 100, 'F05', '강서구 미음지구 R\&D허브단지 내 I4-1, 미음동 1529-1번지', '2014-01-01', '2018-04-30', '- 규   모 : 지하1층/지상3층(2개동), 연면적 약 2,897㎡rn', 'B03', '051-888-6314', '74.87억원', 35.16248259, 128.8637995);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(95, 95, '차집시설통합관리센터 건립(차집시설 개량 및 통합관리시스템 건축공사)☞공사완료', 3303, 1095, 4398, 100, 100, 100, 'F05', '동래구 안락동 1108번지(환경공단 내)', '2014-01-01', '2016-12-31', '차차집시설정비 N=1,059개소, 통합관리시스템 1식', 'B02', '051-888-6225', '86억원', 35.18628496, 129.1143556);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(96, 96, '반여 시내버스 공영차고지 조성', 1112, 3286, 4398, 100, 100, 100, 'F06', '부산광역시 해운대구 반여동 496번지 일원', '2014-01-01', '2022-12-31', '차고지 조성 23,244㎡, 건물2,282㎡(124대) - 토목2팀 노기섭 , 보상팀(총부무): 오동열', 'B02', '051-888-6259,051-888-6092', '230억원', 35.2187334, 129.1221811);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(97, 97, '수영강변대로\~삼어로간 연결도로 건설', 1826, 2572, 4398, 100, 100, 100, 'F01', '반여1동 수영강변대로 ∼ 반여4동 삼어로 일원', '2014-01-01', '2021-01-16', '도로건설 L=376m, B=12～15m, 번영로 선형개량400m,rn               교량L=228m(합성라멘교 60.0m, ST.BOX.GR 168.0m)', 'B01', '051-888-6182,051-888-6186', '194억원', 35.1947616, 129.1222598);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(98, 98, '부산 그린레일웨이 조성사업(3차)', 2483, 1915, 4398, 100, 100, 100, 'F06', '해운대 기계공고～미포, 송정～동부산관광단지 경계', '2014-01-01', '2019-03-31', '휴식공간조성 L=9,800m (산책로, 자전거도로, 휴게시설 등)', 'B01', '051-888-6425', '316억원', 35.16324485, 129.1637105);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(99, 99, '해운대수목원 조성사업(1단계 3차)', 3564, 729, 4293, 100, 100, 100, 'F06', '해운대구 석대동 24번지 일원', '2014-04-16', '2016-04-14', '○ 위     치 : 해운대구 석대동 24번지 일원 rn○ 규     모 : A=628,275㎡(1단계 414,994㎡, 2단계 213,281㎡)rn○ 사 업 비 : 97억원(도급 70, 관급 27)rn○ 기     간 : 2014. 4. 16 \~ 2016. 4. 14', 'B02', '888-6295', '97억원(도급 70, 관급 27)', 35.23016362, 129.1332418);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(100, 100, '덕천오수중계펌프장 이설', 2938, 1311, 4249, 100, 100, 100, 'F03', '북구 구포동 덕천유수지 일원', '2014-05-30', '2017-12-31', '오수중계펌프장 (Q=160,000㎥/1개소rn차집관로 (1,200\~1,500㎜) : L=136m', 'B02', '051-888-6224', '117억원', 35.21023379, 129.0011459);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(101, 101, '소방안전체험관 건립☞공사완료', 3602, 630, 4232, 100, 100, 100, 'F05', '동래구 온천동 330번지 일원(금강공원내)', '2014-06-16', '2016-03-07', '○ 사업개요rn- 위치 : 동래구 온천동 330번지 일원(금강공원 내)rn- 규모 :  지하1층/지상3층, 부지 16.192㎡, 연면적 7,888㎡rn- 사업비 : 293.74rn- 사업기간 : 2012. 6. \~ 2016. 3.', 'B03', '888-6315', '293.74', 35.21909024, 129.0756301);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(102, 102, '레이저가공기술산업화지원센터 건립공사☞공사완료', 3714, 473, 4187, 100, 100, 100, 'F05', '강서구 미음지구 허브단지내', '2014-07-31', '2015-11-16', '○ 사업개요rn- 위   치 : 강서구 미음지구 허브지구 내 rn- 규   모 : 지하1/지상3층, 3,700㎡(부지면적 6,600㎡)rn- 사업비 : 101.06억원rn- 사업기간 : 2012. \~ 2015. 11.', 'B03', '051-888-6317', '101.06', 35.16183035, 128.8651893);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(103, 103, '학리항정비공사(서방파제)', 3487, 577, 4064, 100, 100, 100, 'F05', '부산 기장군 일광면 학리항내', '2014-12-01', '2016-06-30', '동방파제 접안시설확장 71.0mrn서방파제 신설 80.0m', 'B02', '051-888-6265', '37.2억원', 35.25802784, 129.2447132);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(104, 104, '동남권 방사선 의.과학일반산단 진입도로 건설', 2787, 1261, 4048, 100, 100, 100, 'F01', '일반산단 서측도로망\~국도14호선\~장안IC 연결', '2014-12-17', '2018-05-31', 'L=1,820m, 장안IC. 1개소(트럼펫->클로버)', 'B01', '051-888-6161', '487억원', 35.31293763, 129.242976);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(105, 105, '연지근린공원 조성공사', 3229, 810, 4039, 100, 100, 100, 'F06', '부산진구 초읍동 산66-1번지 일원', '2014-12-26', '2017-03-15', '공원조성 A = 57,380㎡rn', 'B02', '051-888-6292', '160억원', 35.17782309, 129.0499067);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(106, 106, '아시아 영화학교 건립 리모델링☞공사완료', 3395, 638, 4033, 100, 100, 100, 'F05', '수영구 광안동 1276-1(舊 공무원교육원 생활관 건물)', '2015-01-01', '2016-09-30', '지하1층, 지상3층, 연면적1,709.91㎡, 철근콘크리트 건물 리모델링', 'B03', '051-888-6334', '20.47억원', 35.15041795, 129.1092576);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(107, 107, '부산박물관 전시관 리모델링☞공사완료', 3122, 911, 4033, 100, 100, 100, 'F05', '남구 유엔평화로 63(대연동) 부산박물관내', '2015-01-01', '2017-06-30', '부지면적 29,437㎡, 연면적 6,313㎡, 지하1층/지상2층', 'B03', '051-888-6336', '66.99억원', 35.12938967, 129.0934021);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(108, 108, '부산도서관 건립', 2087, 1946, 4033, 100, 100, 100, 'F05', '사상구 덕포동 415-2번지 (상수도계량기 검사센터)', '2015-01-01', '2020-04-30', '지하2층/지하5층 부지면적 10,318㎡, 연면적 16.303㎡', 'B03', '051-888-6334', '420억원', 35.17297141, 128.983012);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(109, 109, '금련산 청소년 수련원 기능보강공사☞공사완료', 3730, 303, 4033, 100, 100, 100, 'F05', '수영구 광안4동 산60-3', '2015-01-01', '2015-10-31', '지하1층/지상3층 생활관, 야외화장실, 운동장 기능보강', 'B03', '051-888-6331', '10', 35.1551318, 129.1014352);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(110, 110, '부산진소방서 건립☞공사완료', 2726, 1307, 4033, 100, 100, 100, 'F05', '부산시 진구 서전로43(전포동)', '2015-01-01', '2018-07-31', '부지면적 987㎡, 연면적 5,664.16㎡, 지하2층/지상7층rn', 'B03', '051-888-6316', '138.79억원', 35.15818158, 129.0645346);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(111, 111, '청학119안전센터 건립☞공사완료', 3244, 789, 4033, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2015-01-01', '2017-02-28', '부지면적 566㎡, 연면적 750㎡, 지상3층', 'B03', '051-888-6335', '16.74억원', 35.09793824, 129.0566106);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(112, 112, '녹산 및 중앙하수처리장 감시제어설비 교체', 3699, 334, 4033, 100, 100, 100, 'F03', '강서구 녹산산단 382로 49번길 39, 서구 암남동 원양로 6', '2015-01-01', '2015-12-01', '중앙감시제어설비 1식, 현장제어반설비(RCS) 1식 등', 'B03', '051-888-6383', '7.7억원', 35.08531359, 128.8794961);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(113, 113, '하수처리장 노후시설 개선', 3669, 364, 4033, 100, 100, 100, 'F04', '동래구 온천천남로 185 수영하수처리장 등 12개소', '2015-01-01', '2015-12-31', '노후 슬러지수집기 교체 등 12개소', 'B03', '051-888-6355', '98', 35.18817419, 129.1124726);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(114, 114, '자갈치 글로벌수산 명소화 건립☞공사완료', 2573, 1460, 4033, 100, 100, 100, 'F05', '중구 남포동 6가 117-3번지', '2015-01-01', '2018-12-31', '부지면적 2,240㎡(L=224m, B=10m) 연면적 2,288.03㎡ 지상2층', 'B03', '051-888-6317', '93.45억원', 35.09655942, 129.0261156);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(115, 115, '근대건축문화자산(청자빌딩) 리모델링☞공사완료', 2943, 1090, 4033, 100, 100, 100, 'F05', '구 동광동 3가 11(구.한성은행 부산지점,청자빌링)', '2015-01-01', '2017-12-26', '지상3층, 연면적 652.46㎡', 'B03', '051-888-6334', '14억원', 35.10622698, 129.0323731);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(116, 116, '자성고가교 철거 및 평면도로정비공사', 2208, 1825, 4033, 100, 100, 100, 'F01', '동구 범일동 330-24번지 일원(성남초등학교 주변 자성대교차로)', '2015-01-01', '2019-12-31', '자성고가교 철거 rnL=1,078mrnB=5\~9m', 'B01', '051-888-6424,051-888-6425', '86.5억', 35.1292668, 129.0453058);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(117, 117, '해운대과선교 철거공사 실시설계용역', 2848, 1185, 4033, 100, 100, 100, 'F01', '해운대구 중동 1772번지 일원(해운대 온천사거리\~신시가지 방향)', '2015-01-01', '2018-03-31', '과선교 철거(L=580m, B=15m), 평면도로정비 1식', 'B01', '051-888-6422', '10,000백만원', 35.16306667, 129.1635961);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(118, 118, '하수관거정비(대연용호분구BTL)', 2918, 1095, 4013, 100, 100, 100, 'F03', '남구대연동, 용호동일원', '2015-01-21', '2018-01-20', '하구관거 L=79,149km, 배수설비 N=8,782가구', 'B02', '051-888-6256', '720억원', 35.1418237, 129.0987233);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(119, 119, '구포생태공원 수해복구공사', 3635, 364, 3999, 100, 100, 100, 'F03', NULL, '2015-02-04', '2016-02-03', '사면보강 L=800m, H=30m', 'B02', '051-888-6251', '72', 35.19463598, 129.0124768);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(120, 120, '초량천 생태하천 복원사업', 1539, 2448, 3987, 100, 100, 100, 'F06', '동구하나은행\~부산고등학교 입구', '2015-02-16', '2021-10-30', '복개복원 L=316m, B=25m', 'B02', '051-888-6228', '370억원', 35.11924914, 129.0401899);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(121, 121, '덕천교차로 일원 하수시설 개선복구사업', 3609, 365, 3974, 100, 100, 100, 'F03', '부산시 덕천교차로 일원', '2015-03-01', '2016-02-29', 'PC암거(1.0\*1.5) L=102m,(1.5\*1.0) L=244m', 'B02', '051-888-6254', '21.48억원', 35.21050797, 129.0052703);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(122, 122, '도심대형재래시장분류식하수관로설치공사(부전서면시장)', 2938, 1028, 3966, 100, 100, 100, 'F03', '부전 서면시장', '2015-03-09', '2017-12-31', '오수관로 (D200\~500mm) L=8,731km, 배수설비 N=790개소', 'B02', '051-888-6252', '148억원', 35.16012421, 129.0594701);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(123, 123, '동천 명품보행전용교량 건설공사', 3537, 406, 3943, 100, 100, 100, 'F01', '남구 문현금융단지 앞 동천내', '2015-04-01', '2016-05-11', '보행교량 L=41.7m, B=6\~12m', 'B01', '051-888-6422', '37', 35.13975166, 129.0704099);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(124, 124, '강변하수 소화조효율 개선', 3303, 640, 3943, 100, 100, 100, 'F03', '사하구 을숙도대로 466(강변하수처리장 내)', '2015-04-01', '2016-12-31', '소화조 시설용량 40,000㎥(5,000㎥× 8조)', 'B03', '051-888-6364', '130억원', 35.08166795, 128.9550141);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(125, 125, '덕천 오수중계 펌프장 이설 전기,소방공사', 3288, 611, 3899, 100, 100, 100, 'F01', '북구 구포동 덕천유수지 일원', '2015-05-15', '2017-01-15', '동력설비 1식, 전등,전열 설비1식', 'B01', '051-888-6383', '123백만원', 35.20965069, 129.0004399);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(126, 126, '덕천오수중펌프장 이설 기계공사', 3303, 579, 3882, 100, 100, 100, 'F01', '북구 구포동 덕천유수지 일원', '2015-06-01', '2016-12-31', '배관 및 지자재 설치 1식(배관공사,펌프,호이스트 등)', 'B03', '051-888-6362', '2,679백만원', 35.21009202, 129.0009997);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(127, 127, '도시고속도로 주변 방음시설 설치공사', 2208, 1660, 3868, 100, 100, 100, 'F01', '해운대구 건영LIG Apt. 일원', '2015-06-15', '2019-12-31', '방음터널설치 L=300m', 'B01', '051-888-6153', '2,480백만원', 35.17808299, 129.181489);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(128, 128, '오리일반산업단지 진입도로 건설', 2741, 1116, 3857, 100, 100, 100, 'F01', '기장군 장안읍 오리(국도14호선) \~ 오리일반산업단지', '2015-06-26', '2018-07-16', 'L=1,040m B=22\~30m(4차로)', 'B01', '051-888-6417', '158억원', 35.36714929, 129.2622308);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(129, 129, '자동차부품 글로벌 품질인증센터 건립☞공사완료', 2818, 1034, 3852, 100, 100, 100, 'F05', '강서구 미음R\&D허브단지(I7-1), 미음동 1528-9번지', '2015-07-01', '2018-04-30', '지하1층/ 지상2층, 연면적 약3,953.46㎡rn', 'B03', '051-888-6314', '109.8억원', 35.16172607, 128.8661087);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(130, 130, '만덕119안전센터 건립☞공사완료', 3152, 700, 3852, 100, 100, 100, 'F05', '북구 만덕동 944-1번지', '2015-07-01', '2017-05-31', '부지면적 1,112㎡, 연면적 897.75㎡, 지상4층', 'B03', '051-888-6336', '17.14억원', 35.20490655, 129.0331301);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(131, 131, '문화회관 중극장 리모델링사업☞공사완료', 2969, 883, 3852, 100, 100, 100, 'F05', '남구 유엔평화로 76번길 1', '2015-07-01', '2017-11-30', '지하1층, 지상3층, 연면적 7,210㎡ 중극장 및 부대시설 리모델링', 'B03', '051-888-6334', '96억원', 35.12922815, 129.0891859);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(258, 258, '부산환경체험교육관 건립사업', 293, 1548, 1841, 100, 100, 100, 'F05', '부산광역시 해운대구 재반로242번길 51-10', '2021-01-01', '2025-03-29', '본관 동관(1\~3층)리모델링 및 내진보강공사', 'B03', '051-888-6316', '100억원', 35.1987524, 129.1351425);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(132, 132, '연지근린공원 내 생태체험센터 건립☞공사완료', 3317, 516, 3833, 100, 100, 100, 'F05', '부산진구 초읍동 산66-1일원', '2015-07-20', '2016-12-17', '- 건축개요 : 지하2층/지상2층, 연면적 3,881.05㎡rn- 건 축 비 : 70.53억원(공사 68.23, 감리 2.3)rn- 공사기간 : ’15.07.20 \~ ’16.10.11   rn- 시 공 사 : 천우종합토건㈜ + ㈜티엘갤러리rn- 감     리 : ㈜삼영기', 'B03', '051-888-6314', '70.53', 35.1800403, 129.0488209);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(133, 133, '노포동 화물차 공영차고지 건축공사☞공사완료', 3303, 528, 3831, 100, 100, 100, 'F05', '금정구 노포동 108-2번지', '2015-07-22', '2016-12-31', '지하1층, 지상2층, 연면적 1,810㎡, R.C조', 'B03', '051-888-6258', '24', 35.28461686, 129.1009524);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(134, 134, '군 수영부두 대체시설 건립(동원막사) 기계설비공사☞공사완료', 3244, 546, 3790, 100, 100, 100, 'F01', NULL, '2015-09-01', '2017-02-28', '위생설비 등 1식(배관공사,펌프)', 'B01', '051-888-6355', '465백만원', 35.11955633, 129.0709515);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(135, 135, '하수관로 신설공사수영처리구역\[한양아파트]일원]', 1402, 2374, 3776, 100, 100, 100, 'F03', '연제구 연산 1, 8, 9동 일원', '2015-09-15', '2022-03-16', '관로(D=200\~600mm) L=27.250km, 배수설비 3,089개소', 'B02', '051-888-6247', '370억원', 35.1897161, 129.103621);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(136, 136, '부산 그린레일웨이 조성사업(1차)', 3305, 463, 3768, 100, 100, 100, 'F06', '해운대 올림픽교차로 \~ 기장군 동부산관광단지 경계', '2015-09-23', '2016-12-29', '휴식공간조성 L=1,600m (산책로, 자전거도로, 휴게시설)', 'B01', '051-888-6426', '2,794백만원', 35.16249375, 129.1623738);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(137, 137, '하수관로신설(확층)공사(장림처리구역(하단동일원))', 1855, 1898, 3753, 100, 100, 100, 'F03', '사하구 하단동 일원', '2015-10-08', '2020-12-18', '하수관거 L=16.134㎞, 배수설비 N=1,715가구', 'B02', '051-888-6251', '289억원', 35.1044479, 128.974933);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(138, 138, '원동IC \~ 올림픽 교차로간 BRT 설치 전기공사', 3113, 622, 3735, 100, 100, 100, 'F01', '부산 동래구 원동ic', '2015-10-26', '2017-07-09', '전기인입 공사 1식, 가로등 설치26본', 'B03', '051-888-6374', '2.7억원', 35.19632571, 129.1132106);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(139, 139, '구덕전통문화체험관 건립☞공사완료', 3122, 609, 3731, 100, 100, 100, 'F05', '서구 서대신3가 산18-1번지(구덕문화공원)', '2015-10-30', '2017-06-30', '연면적 808㎡, 지상3층', 'B03', '051-888-6336', '38', 35.12582163, 129.0049246);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(140, 140, '진태고개 생태축 연결사업', 3004, 679, 3683, 100, 100, 100, 'F01', '기장군 정관면 모전리 13-7번지 일월', '2015-12-17', '2017-10-26', '생태교량 L=38.8m, B=33.8m\~42.8m 등', 'B01', '051-888-6207', '55억원', 35.35691335, 129.1446234);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(141, 141, 'APEC기후센터 증축사업☞공사완료', 2787, 881, 3668, 100, 100, 100, 'F05', '해운대구 센텀7로 12', '2016-01-01', '2018-05-31', '증축 1개층(4층부분), 증축면적 533.62㎡rn', 'B03', '051-888-6316', '17억원', 35.17390681, 129.1254709);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(142, 142, '하수관로 확충(해운대, 송정해수욕장일원)', 2585, 1083, 3668, 100, 100, 100, 'F03', '해운대구 중동, 송정동 일원', '2016-01-01', '2018-12-19', '하수관로(D=80\~300mm) L=11,406km, 배수설비 681가구', 'B02', '051-888-6228', '157억원', 35.16308836, 129.1635923);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(143, 143, '노동복지회관 전면 개보수☞공사완료', 3244, 424, 3668, 100, 100, 100, 'F05', '동구 자성로 141번길 13(범일동 830-240번지)', '2016-01-01', '2017-02-28', '노후된 시설물 보수·보강하여 건물 안전성을 높임', 'B03', '051-888-6318', '10', 35.1385174, 129.0656395);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(144, 144, '한국신발관 리모델링☞공사완료', 2907, 761, 3668, 100, 100, 100, 'F05', '부산진구 백양대로 227', '2016-01-01', '2018-01-31', '지하1층\~3층 연면적 4,141㎡(리모델링)rn-역사전시관, 멀티호옵관, 교육.체험학습관, 인력양성관, 기업 비지니스 지원 등', 'B03', '051-888-6332', '29.54억원', 35.16133741, 129.0346127);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(145, 145, '구포119안전센터 재건축 사업☞공사완료', 2907, 761, 3668, 100, 100, 100, 'F05', '북구 만덕대로 31', '2016-01-01', '2018-01-31', '부지면적 421.8㎡, 연면적 841.95㎡, 지상4층', 'B03', '051-888-6335', '18.1억원', 35.21081441, 129.0041798);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(146, 146, '지사119안전센터 건립공사☞공사완료', 2938, 730, 3668, 100, 100, 100, 'F05', '강서구 지사동 1218-3번지', '2016-01-01', '2017-12-31', '지상4층 1개동, 연면적 958.49㎡', 'B03', '051-888-6335', '17.15억원', 35.21219795, 128.9805706);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(147, 147, '생곡쓰레기 매립장(2-1단계) 조성공사-공사준공', 534, 3134, 3668, 100, 100, 100, 'F04', '강서구 생곡동 생곡산단로 90 (봉화산일원)', '2016-01-01', '2024-07-31', '쓰레기 매립, 복토 V=2,168천㎥', 'B02', '051-888-6225', '194억원', 35.12728759, 128.8726221);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(148, 148, '부산패션비즈센터 건립 공사', 1538, 2130, 3668, 100, 100, 100, 'F05', '동구 범일동 26-4번지', '2016-01-01', '2021-10-31', '연면적 7,677㎡rn지하2/지상6', 'B03', '051-888-6316', '293억원', 35.13879776, 129.0608195);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(149, 149, '모전교\~협성르네상스간 도로개설(용역)', 2208, 1460, 3668, 100, 100, 100, 'F01', '기장군 정관읍 모교전\~정관 협성르네상스아파트', '2016-01-01', '2019-12-31', '도로개설L=637m, B=25m', 'B01', '051-888-6201', '16,000백만원', 35.23150199, 129.2122643);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(150, 150, '시민 친화적 구덕 운동장 재개발사업', 2665, 1003, 3668, 100, 100, 99.9, 'F05', '서구 서대신동 3가 210-1번지 일원', '2016-01-01', '2018-09-30', '생활체육공원 조성 1식(A=35,600㎡)', 'B02', '051-888-6245', '105억원', 35.11569534, 129.015611);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(151, 151, '덕천동\~아시아드주경기장(만덕3터널) 도로 건설', 947, 2702, 3649, 100, 100, 100, 'F01', '북구 만덕동～연제구 거제동', '2016-01-20', '2023-06-14', '도로건설 L=4,370m, B=20\~45m(4차로)rn - 도로정비 1,680m, 터널 2,241m, 접속도로 449m', 'B01', '051-888-6185,051-888-6187', '1,510억원', 35.20466337, 129.035803);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(152, 152, '하단119안전센터 건립☞공사완료', 2999, 638, 3637, 100, 100, 100, 'F05', '사하구 낙동남로1407', '2016-02-01', '2017-10-31', '지상5층 1개동, 연면적 808.23㎡, 부지면적 340.10㎡', 'B03', '051-888-6318', '18.84억원', 35.10651255, 128.9656746);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(153, 153, '레포츠 섬유발전 기반구축사업', 2848, 789, 3637, NULL, NULL, NULL, 'F05', '강서구 미음동 1528-1번지', '2016-02-01', '2018-03-31', '염·가공 융합소재 및 섬유산업 기술지원체제 구축', NULL, '888-6313', '265억원', 35.21219795, 128.9805706);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(154, 154, '부산광역시 노인회관 건립☞공사완료', 2573, 1064, 3637, 100, 100, 100, 'F05', '부산진구 전포동 123', '2016-02-01', '2018-12-31', '지하1층 / 지상8층, 부지면적 466㎡, 연면적 2,288㎡', 'B03', '051-888-6335', '67억원', 35.16338362, 129.0606936);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(155, 155, '2016년 하수처리장 노후시설개선사업', 3060, 577, 3637, 100, 100, 100, 'F03', '사하구 원양로 6(중앙하수처리장) 외 3개소', '2016-02-01', '2017-08-31', '공공하수처리시설 노후 기자채 교체 1식rnrn       >원심탈수기 교체 4대(중앙 2, 녹산 1, 서부 1)rnrn       >강변공공하수처리시설 송풍기(370㎥/분) 1대 교체rn', 'B03', '051-888-6364', '19.1억원', 35.1044479, 128.974933);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(156, 156, '부산남항 유람선 선착장 구축사업', 2787, 850, 3637, 100, 100, 100, 'F08', '부산광역시 중구 자갈치시장 전면 해상 일원', '2016-02-01', '2018-05-31', '유람선 선착장(pontoon) 구축 L=53m, B=15m', 'B01', '051-888-6157', '29.12억원', 35.09665939, 129.025526);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(157, 157, '덕천 오수중계 펌프장 이설 정보통신공사', 3288, 323, 3611, 100, 100, 100, 'F01', '북구 구포동 덕천유수지 일원', '2016-02-27', '2017-01-15', '구내통신 1식,CCTV 1식', 'B03', '051-888-6385', '46,652천원', 35.20991404, 129.0008636);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(158, 158, '무형문화재 기능분야 전수교육관 건립', 2634, 974, 3608, 100, 100, 100, 'F05', '수영구 광안동 산106번지(구 공무원교육원 뒤편 주차장 부지)', '2016-03-01', '2018-10-31', '지상3층, 연면적 1,797㎡', 'B03', '051-888-6317', '41억원', 35.14553823, 129.113134);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(159, 159, '부산섬유 산업진흥센터 건립공사☞공사완료', 2422, 1186, 3608, 100, 100, 100, 'F05', '강서구 미음동 1528-1', '2016-03-01', '2019-05-31', '부지면적 11,862㎡, 연면적 3,330㎡, 지상3층 , 지상2층 2개동', 'B03', '051-888-6316', '83.97억원', 35.15222202, 128.8722997);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(160, 160, '덕천(화명)\~양산간 도로 개설 전기공사', 3293, 291, 3584, 100, 100, 100, 'F01', '북구 덕천(화명)동 ～ 양산시 경계', '2016-03-25', '2017-01-10', '가로등설치 79본,교량점검등 398등', 'B01', '051-888-6382', '1,405백만원', 35.19729594, 128.9900366);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(161, 161, '동천 하상준설공사', 3258, 323, 3581, 100, 100, 100, 'F01', '동천(광무교\~범일교)일원', '2016-03-28', '2017-02-14', '\*사업규모: 하상준설 L=1,77km V=34,698㎥ rnrnrn', 'B01', '051-888-6421', '3,000백만원', 35.1492294, 129.0599854);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(162, 162, '첨단신발융합허브센터 건립☞공사완료', 2634, 944, 3578, 100, 100, 100, 'F05', '사상구 감전동 515-4번지', '2016-03-31', '2018-10-31', '연면적 20,477㎡, 지상6층', 'B03', '051-888-6334', '430억원', 35.13273521, 128.9668972);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(163, 163, '수정터널 상부공간 연결(공원화) 사업\[준공]', 2208, 1369, 3577, 100, 100, 100, 'F06', '부산진구 가야동 관문대로(수정터널입구\~요금소)', '2016-04-01', '2019-12-31', 'A=9,000㎡(L=180m, B=40\~70m)', 'B01', '051-888-6184,051-888-6181', '228.2억원', 35.14934681, 129.0333047);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(164, 164, '하수관로 정비(수민분구, BTL)', 2620, 943, 3563, 100, 100, 100, 'F03', '부산광역시 동래구 금정구 일원', '2016-04-15', '2018-11-14', '하수관로(D=200～700㎜) L=97.976km, 배수설비 8,754가구', 'B02', '051-888-6252', '808억원', 35.20496978, 129.083672);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(165, 165, '금강공원 주차장 조성사업', 714, 4264, 3550, 1, 100, 1, 'F06', '부산광역시 동래구 온천동 276-3번지 일원', '2016-04-28', '2027-12-31', 'A=7,198㎡, 주차면수 193대', 'B02', '051-888-6236', '218억원', 35.21814409, 129.0751009);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(166, 166, '군수영부두 대체시설 건립(소선박부두) 전기공사☞공사완료', 3234, 287, 3521, 100, 100, 100, 'F05', NULL, '2016-05-27', '2017-03-10', '옥외전기공사 1식, 옥외조명탕설비공사 1식', 'B03', '051-888-6384', '376백만원', 35.11927033, 129.0708127);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(167, 167, '장안\~임랑간 도로건설 가로등 설치공사', 3018, 495, 3513, 100, 100, 100, 'F06', NULL, '2016-06-04', '2017-10-12', '가로등 설치 133본(1등용 83본,2등용 50본)', 'B03', '051-888-6371', '5.42억원', 35.32611325, 129.2438678);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(168, 168, '첨단신발융합허브센터 건립사업(정보통신 분야)', 2966, 541, 3507, 100, 100, 100, 'F01', '사상구 감전동 515-4번지', '2016-06-10', '2017-12-03', 'CCTV카메라 2M 31대, 전관방송(1,800W).통합배선설비 1식', 'B03', '051-888-6375', '691백만원', 35.13281664, 128.9668772);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(169, 169, '부산 그린레일웨이 조성사업(2차)', 2958, 532, 3490, 100, 100, 100, 'F06', '해운대 기계공고\~미포, 송정\~동부산관광단지 경계', '2016-06-27', '2017-12-11', '휴식공간조성 L=3,400m (산책로, 자전거도로, 휴게시설 등)', 'B01', '051-888-6426', '4,189백만원', 35.16308836, 129.1635923);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(170, 170, '청학119안전센터 건립사업(정보통신분야)☞공사완료', 3244, 242, 3486, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2016-07-01', '2017-02-28', 'cctv카메라 2m 4대, 전관방송(240w).통합배선설비 1식rn', 'B01', '051-888-6375', '89백만원', 35.09785672, 129.0561041);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(171, 171, '군수영부두 대체시설(동원막사) 정보통신공사☞공사완료', 3241, 221, 3462, 100, 100, 100, 'F05', NULL, '2016-07-25', '2017-03-03', '통합배선,방송설비,cctv카메라 설치 각1식', 'B03', '051-888-6385', '340백만원', 35.11880418, 129.0706693);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(172, 172, '청학119안전센터 건립 (전기공사)☞공사완료', 3277, 183, 3460, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2016-07-27', '2017-01-26', '수전전력100kW,  전력간선.전열.전등 설비공사', 'B03', '051-888-6374', '1.71억원', 35.09792581, 129.0562813);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(173, 173, '청학119안전센터 건립 (소방공사)☞공사완료', 3277, 183, 3460, 100, 100, 100, 'F05', '영도구 태종로 274 (청학동 335-8번지 외 3필지)', '2016-07-27', '2017-01-26', '자동화재탐지 설비공사 1식, 유도등 설비공사 1식', 'B01', '051-888-6374', '0.15억원', 35.09717286, 129.0560431);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(174, 174, '영상산업센터 2단계 ☞공사완료', 2999, 441, 3440, 100, 100, 100, 'F05', '해운대구 센텀서로 39(우동)/ 1466-2번지', '2016-08-16', '2017-10-31', '- 규모 : 지상4∼12층 증축연면적 9,221.29㎡rn', 'B03', '051-888-6316', '195.5억원', 35.17325026, 129.1320607);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(175, 175, '부산시청사 로비 리모델링 사업☞공사완료', 2938, 456, 3394, 100, 100, 100, 'F05', '부산시청 로비(1\~2층 및 지하철연결통로)', '2016-10-01', '2017-12-31', '로비(1∼2층)및 지하철연결통로, 사업대상면적 8,688.57㎡rn', 'B03', '051-888-6314', '36억원', 35.17977539, 129.074959);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(176, 176, '한국야구 명예의 전당 건립', 1630, 1764, 3394, 0, 0, 0, 'F05', '기장군 일광면 동백리 409 일원', '2016-10-01', '2021-07-31', '지하1층, 지상3층, 연면적 3,000㎡(전시관 바닥면적 1,500㎡)', 'B03', '051-888-6335', '108억원', 35.30816276, 129.2458342);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(177, 177, '부산 탁구체육관 설립☞공사완료', 2239, 1155, 3394, 100, 100, 100, 'F05', '영도구 동삼동 1163번지(동삼혁신도시)', '2016-10-01', '2019-11-30', '지상2층, 연면적 1,288㎡, 운동시설', 'B03', '051-888-6335', '4,061백만원', 35.09123989, 129.0678888);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(178, 178, '부산희망드림종합센터 건립', 1910, 1453, 3363, 100, 100, 100, 'F05', '동구 좌천동 68-836번지(부산진역 인근)', '2016-11-01', '2020-10-24', '부지면적 1,271㎡, 연면적 981.58㎡, 지상3층', 'B03', '518886318', '55.26억원', 35.12861493, 129.0491111);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(179, 179, '온천천 상류 일원 하수관로 신설(확충)', 1510, 1825, 3335, 100, 100, 100, 'F07', '금정구 남산동 부곡동일원', '2016-11-29', '2021-11-28', '관로공사 L=32.1km, 배수설비 2,788가구', 'B02', '051-888-6254', '44,542백만원', 35.27296846, 129.0856632);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(180, 180, '하수관로신설(확충)공사 \[초량천수계]', 1510, 1825, 3335, 100, 100, 100, 'F07', '부산광역시 동구 충장대로 206 \~', '2016-11-29', '2021-11-28', '하수관로(D80\~400mm) L=33,16km 배수설시 N=5,245가구', 'B02', '051-888-6244', '478.4억원', 35.11629097, 129.0467405);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(181, 181, '재송동 일원 하수관로 신설(확충)', 2392, 941, 3333, 100, 100, 100, 'F03', '해운대구 재송동, 반여동 일원', '2016-12-01', '2019-06-30', '관거(D=200∼400㎜) L=8.37km, 배수설비 1,025가구', 'B02', '051-888-6254', '130억원(공사 103, 감리 10, 기타 17) ▷ 국비39, 시비91', 35.18844953, 129.1224907);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(182, 182, '을숙도대교 장림고개간 지하차도 건설', 808, 2525, 3333, 100, 100, 100, 'F01', '사하구 신평동(을숙도대교)\~구평동(장림고개)', '2016-12-01', '2023-10-31', '도로건설 L=2.310m, B=21.7m\~35.0m(4차로\~6차로)rnrn                 ▷지하차도 1,410m 터널 590m 포함,  도로정비 310mrnrn', 'B01', '051-888-6155', '2,526억원', 35.08503648, 128.9718248);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(183, 183, '하수관로 확충(개금·부전동일원)', 2087, 1246, 3333, 100, 100, 100, 'F07', '부산진구 개금동, 부전동 일원', '2016-12-01', '2020-04-30', '하수관로(D80∼400㎜) L=9.655㎞, 배수설비 972가구', 'B02', '051-888-6245', '179억원', 35.15709406, 129.0205494);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(184, 184, '부산역광장 국가선도 도시재생사업', 2453, 880, 3333, 100, 100, 100, 'F05', '동구 초량동 1192번지 일원(부산역 광장)', '2016-12-01', '2019-04-30', '지하1층, 지상2층, 연면적 4,790.25㎡, 문화집회시설 건출물rnrn         연결데크시설(부산역주차장 ↔ 간선도로 버스베이)rnrnrn              '' 시설물: H 7m, B 13m 보행자 연결테크(부산역 주차장\~버스베', 'B03', '051-888-6332', '224억원', 35.11411417, 129.0411586);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(185, 185, '원전부품.설비 통합인증센터 건립☞공사완료', 2269, 1064, 3333, 100, 100, 100, 'F05', '강서구 미음동 1528-7(미음R\&D 허브단지내)', '2016-12-01', '2019-10-31', '연면적 2,902㎡rn지상1\~2층, 3개동', 'B03', '051-888-6316', '129억', 35.21219795, 128.9805706);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(186, 186, '일광공공하수처리시설 건설공사', 1903, 1400, 3303, 100, 100, 100, 'F03', '기장군 일광면 삼성리 454번지 일원', '2016-12-31', '2020-10-31', '하수처리시설 Q=9,000㎥, 방류관로 L=1,67km', 'B02', '051-888-6222', '356억원', 35.25821635, 129.2208345);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(187, 187, '중부소방서 재건축', 2050, 1252, 3302, 100, 100, 100, 'F05', '중구 중앙대로 110(중앙동4가 83-2 외 1필지)', '2017-01-01', '2020-06-06', '지상6층, 연면적 4,266.71㎡', 'B03', '051-888-6315', '105억원', 35.10698233, 129.0365503);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(188, 188, '망미119안전센터 건립', 2573, 729, 3302, 100, 100, 100, 'F05', '수영구 연수로328(망미동 792-10 외 2필지)', '2017-01-01', '2018-12-31', '지상3층 1개동, 연면적 620㎡, 부지면적 463.2㎡', 'B03', '051-888-6316', '39.04억원', 35.14553823, 129.113134);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(189, 189, '도시고속도로 방음시설 설치공사', 2938, 364, 3302, 100, 100, 100, 'F01', '사업개요 - 담당자: 도로1팀 신승모 051 888 6156', '2017-01-01', '2017-12-31', '방음시설(터널)설치 L=533m(동서고가 300m,해운대233m)', 'B01', '051-888-6155', '55억원', 35.16306667, 129.1635961);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(190, 190, '생곡음식물쓰레기 자원화\[발전]시설 대수선사업☞공사완료', 2726, 576, 3302, 100, 100, 100, 'F05', '강서구 생곡산단로 76', '2017-01-01', '2018-07-31', '전처리시설, 혐기성소화설비, 악취제거설비 등', 'B03', '051-888-6355', '40억원', 35.21219795, 128.9805706);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(191, 191, '산성구조구급센터 건립☞공사완료', 2757, 545, 3302, 100, 100, 100, 'F05', '금정구 금성면 143-7번지 (부지연적 745㎡)', '2017-01-01', '2018-06-30', '지상3층, 연면적 660㎡', 'B03', '051-888-6332', '16.3억원', 35.24277705, 129.0921041);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(192, 192, '부산남항 물양장 확충사업☞공사완료', 2514, 757, 3271, 100, 100, 100, 'F08', '부산광역시 중구 남포동6가 117-3번지 전면해상', '2017-02-01', '2019-02-28', '잔교식 물양장 L=224.0m x B=35.5m', 'B01', '051-888-6157', '199억', 35.09656431, 129.028517);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(193, 193, '수산식품특화단지 폐수처리장 운영개선 사업', 2208, 1063, 3271, 100, 100, 100, 'F03', '부산광역시 사하구 장림로 89', '2017-02-01', '2019-12-31', '고도처리시설(6000㎥/일)', 'B03', '051-888-6352', '90.23억원(공사80, 설계3.2, 감리7.03)', 35.1044479, 128.974933);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(194, 194, '문현,대연동 일원 분류식 하수관로신설', 1477, 1787, 3264, 100, 100, 100, 'F07', '부산광역시 남구 문현동, 대연동 일원', '2017-02-08', '2021-12-31', '오수관거 L=21.1Km, 배수설비 N=1,698가구', 'B02', '051-888-6244', '299.3억원', 35.14773891, 129.0818034);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(195, 195, '하수관로 정비\[사직.장전분구,BTL]', 2063, 1095, 3158, 100, 100, 100, 'F03', '금정구, 동래구, 연제구 일원', '2017-05-25', '2020-05-24', '관로(D80\~D600mm) L=87.695km, 배수설비N=10,170가구', 'B02', '051-888-6254', '794억원', 35.20496978, 129.083672);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(196, 196, '자갈치글로벌 수산명소화 해수인입시설 설치☞공사완료', 2254, 897, 3151, 100, 100, 100, 'F05', '부산광역시 중구 남포동6가 117-3번지 남항 물양장 전면 해상', '2017-06-01', '2019-11-15', '해수인입시설 등 1식', 'B03', '051-888-6364', '18.25억원', 35.10622698, 129.0323731);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(197, 197, '부산 사회복지종합센터 건립', 1143, 2008, 3151, 100, 100, 100, 'F05', '동래구 낙민로 25(낙민동 127-4번지)', '2017-06-01', '2022-11-30', '부지면적 2,970.90㎡, 연면적 4,655.64㎡, 지상6층', 'B03', '888-6334', '214.4억원', 35.20050687, 129.0893415);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(198, 198, '동천생태하천복원(수질개선)사업', 1936, 1207, 3143, 100, 100, 100, 'F01', '부산진구 광무교\~동구 북항입구', '2017-06-09', '2020-09-28', '도수펌프장:Q=25만㎥/일, 도수관로: D800\~1650, L=2,478m', 'B01', '051-888-6416', '281억원', 35.16285537, 129.0531698);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(199, 199, '녹산하수 소화조 설치사업', 931, 2198, 3129, 100, 100, 100, 'F03', '강서구 녹산산단382로49번길 39 녹산하수처리시설내', '2017-06-23', '2023-06-30', '소화조(5,300㎥/일 4조) 및 교반 가온설비, 부대설비 1식rn(051-973-7445)', 'B03', '051-888-6362', '409억원(공사 386, 기타 23) ▷ 국비 96  시비 313', 35.08784408, 128.8644457);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(200, 200, '마린시티 월파방지시설\[TTP] 재해복구공사', 2963, 149, 3112, 100, 100, 100, 'F02', '해운대구 우동 1447번지 전면 공유수면 일원', '2017-07-10', '2017-12-06', '월파방지시설(TTP)설치 N=1,555개 (16ton/개, L=640m)', 'B02', '051-888-6231', '3,428백만원', 35.15382903, 129.1438866);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(201, 201, '수영만 자연재해위험개선지구 정비사업', 714, 3773, 3059, 15.9, 18.1, 87.85, 'F01', '해운대구 우3동 수영만(마린시티 앞) 일원 전면 해상', '2017-09-01', '2027-12-31', '방재시설 이안제(T.T.P) L=500m', 'B01', '051-888-6202,051-888-6201', '696억원', 35.15359059, 129.1436115);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(202, 202, '해운대과선교 철거 및 평면도로 정비공사', 2809, 239, 3048, 100, 100, 100, 'F01', '해운대구 중동 1772번지 일원(해운대 온천사거리～신시가지 방향)', '2017-09-12', '2018-05-09', '과선교 철거(L=580m, B=15m), 평면도로정비 1식', 'B01', '051-888-6421', '5,979백만원', 35.16306667, 129.1635961);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(203, 203, '하수관로신설확충(남부처리구역가야분구Ⅰ일원)', 1477, 1512, 2989, 100, 100, 100, 'F03', '부산진구 당감동, 가야동, 개금동 일원', '2017-11-10', '2021-12-31', '관로(D=150～300mm) L=7.766㎞, 배수설비 816가구', 'B02', '051-888-6245', '113억원', 35.15527951, 129.0454346);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(204, 204, '구]구포교  수중교각 등 잔재물 처리공사', 2208, 764, 2972, 100, 100, 100, 'F04', '북구 구포2동 ～ 강서구 대저1동 구) 구포교 수중교각 일원', '2017-11-27', '2019-12-31', '수중교각 및 잔재물 처리((구)구포교 P6～P27)', 'B01', '051-888-6201', '12.5억', 35.19729594, 128.9900366);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(205, 205, '2018 하수처리장 노후시설 개선사업', 2330, 607, 2937, 100, 100, 100, 'F03', '수영사업소 등 9개사업소', '2018-01-01', '2019-08-31', '노후 슬러지수집기 교체 등 26건 - 건조시설 2건 제외', 'B03', '051-888-6354', '141억원', 35.14553823, 129.113134);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(206, 206, '부산문화회관 연습실 조성', 2269, 668, 2937, 100, 100, 100, 'F05', '남구 유엔평화로76번길(대연동) - 문화회관 내', '2018-01-01', '2019-10-31', '연면적 733㎡rn지상2층', 'B03', '051-888-6335', '19억원(명시이월)', 35.13652979, 129.0842428);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(207, 207, '고시편집실(집현관) 이전 리모델링☞공사완료', 2453, 484, 2937, 100, 100, 100, 'F05', '북구 금곡동 1910번지', '2018-01-01', '2019-04-30', '연면적 617.34m² 지상2', 'B03', '051-888-6335', '3.78억원', 35.26827619, 129.0212854);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(208, 208, '2018 노후하수시설물 개선사업', 2330, 607, 2937, 100, 100, 100, 'F03', '수영사업소 등 9개', '2018-01-01', '2019-08-31', '악취방지시설설치 등 26건', 'B03', '051-888-6354', '141억원', 35.14548376, 129.1131567);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(209, 209, '감동진 문화포구 조성사업', 1326, 1611, 2937, 100, 100, 100, 'F01', '북구 구포동 166\~화명생태공원', '2018-01-01', '2022-05-31', '금빛노을브릿지(인도교) L=382m, B=3m, 역사체험관 1식', 'B01', '051-888-6154,051-888-6205', '187억원', 35.20995807, 129.0031046);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(210, 210, '신평장림산업단지 개방형 체육관 건립', 761, 2176, 2937, 100, 100, 100, 'F05', '사하구 신평동 651-9', '2018-01-01', '2023-12-17', '연면적 2,163.58㎡, 지하1층/지상2층', 'B03', '051-888-6315', '125억원', 35.09308203, 128.9597273);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(211, 211, '노동복지회관 전면 개보수☞공사완료', 2483, 395, 2878, 100, 100, 100, 'F05', '동구 자성로141번길 13', '2018-03-01', '2019-03-31', '노후시설 개보수로 사용자 편의제공 및 이용 활성화', 'B03', '888-6312', '5억원', 35.13839167, 129.0656143);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(212, 212, '차세대 재활복지의료기기지원센터 건립', 1508, 1339, 2847, 100, 100, 100, 'F05', '사하구 다대동 933-8 외 1필지(부지 1,622.5㎡)', '2018-04-01', '2021-11-30', '연면적 3,894㎡, 지하1층/지상3층', 'B03', '051-888-6336', '130.5억원', 35.05876806, 128.9711928);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(213, 213, '하수관로 정비(중앙․초량․범천분구, BTL)', 1741, 1095, 2836, 100, 100, 100, 'F03', '부산광역시 중구, 동구, 부산진구 일원', '2018-04-12', '2021-04-11', '하수관로(D80\~D800mm) L=74.3Km, 배수설비 N=13,025가구', 'B02', '051-888-6246', '743억원', 35.1292668, 129.0453058);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(214, 214, '하수관로 정비(전포,범천,문현분구, BTL)', 1737, 1095, 2832, 100, 100, 100, 'F07', '부산진구, 남구(문현동), 동구(범일동) 일원, 전포범천문현분구(5.80㎢)', '2018-04-16', '2021-04-15', '하수관로(D=150～600㎜) L=89.574km, 배수설비 10,307가구', 'B02', '051-888-6241', '850억원', 35.17949493, 129.0750232);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(215, 215, '상수원보호구역내 기존관로 정비 및 오수관로 설치공사', 1856, 974, 2830, 100, 100, 100, 'F03', '회동상수원보호구역 일원(부산시 금정구, 기장군, 양산시 일원)', '2018-04-18', '2020-12-17', '기존하수관거 보수(D250～300mm) L=3.263kmrn 하수관거 신설(D80～200mm) L=4.688km, 배수설비598가구', 'B02', '051-888-6254', '120억원', 35.17882246, 129.0748251);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(216, 216, '하수관로 신설(확충)공사\[해운대처리구역(미포,청사포일원)]', 1715, 1102, 2817, 100, 100, 100, 'F03', NULL, '2018-05-01', '2021-05-07', '관로(D=200\~300mm) L=20.151㎞, 배수설비 1,075개소', 'B02', '051-888-6254', '271억원', 35.15888094, 129.1799226);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(217, 217, '시청사 노후 승강기 교체 사업', 1752, 1065, 2817, 100, 100, 100, 'F05', '부산광역시 연제구 중앙대로1001(부산시청)', '2018-05-01', '2021-03-31', '22대(고·저층용 12대, 의회4,비상2, 기타 4대)', 'B03', '051-888-6354', '58억', 35.18569871, 129.0605545);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(218, 218, '정관하수처리장 여과설비 개선공사', 2261, 549, 2810, 100, 100, 100, 'F03', '부산광역시 기장군 정관읍 예림리 1098-1번지 일원', '2018-05-08', '2019-11-08', '여과시설 개선(32,000㎥/일, 상향류식 사여과시설)', 'B02', '051-888-6226', '48억원', 35.24411464, 129.2193184);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(219, 219, '도심대형 재래시장 분류식 하수관로 설치공사(국제·부평시장)', 1722, 1082, 2804, 100, 100, 100, 'F03', '중구 광복동, 부평동 일원', '2018-05-14', '2021-04-30', '관로(D=200\~300mm) L=6.349㎞, 배수설비 1,330개소', 'B02', '051-888-6242', '184억원', 35.10086347, 129.0274064);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(220, 220, '부산오페라하우스 건립', 349, 3144, 2795, 65.75, 65.95, 99.7, 'F05', '북항재개발지구 해양문화지구내', '2018-05-23', '2026-12-31', '- 규   모 : 지하2층/지상5층, 연면적 51,617㎡rn- 시설내용 : 공연장1,800석', 'B03', '051-888-6322', '3,117억원', 35.10833291, 129.0451816);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(221, 221, '당감택지지구 등 노후관로 정비사업', 2329, 457, 2786, 100, 100, 100, 'F07', '당감, 거제, 반여택지지구, 민락매립지, 신리삼거리\~연산R', '2018-06-01', '2019-09-01', '노후오수관로 정비 L=6.17Km', 'B02', '051-888-6246', '60억원', 35.18009707, 129.0740672);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(222, 222, '문전교차로 지하차도 건설', 1265, 1465, 2730, 100, 100, 100, 'F01', '문전교차로 일원(부산진구 전포동 전포지구대 ～ 남구 문현동 부산국제금융센터)', '2018-07-27', '2022-07-31', 'L=435.7m, B=8.0～8.5m(2차로 하행 편도)', 'B01', '051-888-6204', '282억원', 35.15142584, 129.0654172);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(223, 223, '재난안전산업지원센터 건립', 785, 1879, 2664, 100, 100, 100, 'F05', '동래구 수안동 666-10 외 1필지(668-3)', '2018-10-01', '2023-11-23', '지상5층, 연면적 1,972.13㎡', 'B03', '051-888-6332', '197.9억원', 35.2015796, 129.0793783);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(224, 224, '부산시민회관 내진보강 공사', 2208, 456, 2664, 100, 100, 100, 'F05', '동구 자성로 133번길 16, 부산시민회관', '2018-10-01', '2019-12-31', '연면적 14,929.08㎡, 지하1층/지상4층', 'B03', '888-6312', '15억원', 35.13890358, 129.0651885);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(225, 225, '부산남항 물양장 확충사업 2차', 1569, 1059, 2628, 100, 100, 100, 'F08', '부산광역시 중구 남포동5가 117-7번지 전면해상', '2018-11-06', '2021-09-30', '잔교식 물양장 L= 198.0m, B= 10.5∼35.5m', 'B01', '051-888-6161', '180억원(공사 160,설계비 7, 감리비 13) ▷전액국비', 35.09638767, 129.0293789);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(226, 226, '부산남항 수제선(방재호안) 정비사업', 1346, 1276, 2622, 100, 100, 100, 'F05', '서구 등대로 전면해상(서방파제 일원)', '2018-11-12', '2022-05-11', '수제선 정비 L=543m', 'B02', '051-888-6224', '462억원', 35.0835805, 129.026233);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(227, 227, '부산남항 수제선(방재호안) 정비공사', 1346, 1276, 2622, 100, 100, 100, 'F05', '서구 등대로 전면해상(서방파제 일원)', '2018-11-12', '2022-05-11', '방재호안 L=543m', 'B02', '051-888-6222', '46,171백만원', 35.08419158, 129.0263358);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(228, 228, '의류제조 소공인집적지구 공동인프라 증축☞공사완료', 2392, 211, 2603, 100, 100, 100, 'F05', '동구 범일동 830-163번지', '2018-12-01', '2019-06-30', '영세의류제조 소공인 경쟁력 및 부산섬유패션 산업활성화', 'B03', '051-888-6315', '9억원', 35.14022071, 129.0619305);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(229, 229, '기장하수처리장 여과설비 개선공사', 2113, 478, 2591, 100, 100, 100, 'F03', '부산광역시 기장군 기장읍 신천리 254-2번지 일원', '2018-12-13', '2020-04-04', '여과시설개선(13,500㎥/일, 가압부상식)', 'B02', '051-888-6226', '2,334백만원(토목 958, 기계, 914, 전기 312, 감리 150)', 35.24481659, 129.2272133);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(230, 230, '양정동 일원 하수관로 신설(확충)', 836, 1749, 2585, 100, 100, 100, 'F07', '부산진구 양정1·2동, 연제구 거제동 일원', '2018-12-19', '2023-10-03', '하수관로(D150∼D600mm) L=17.908km, 배수설비 1,266가구', 'B02', '051-888-6251', '375억원(공사 332, 감리 22, 기타 21) ▷ 국비111, 시비264', 35.17222363, 129.0686431);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(231, 231, '해운대처리구역 송정이송관로 설치공사', 2033, 547, 2580, 100, 100, 100, 'F07', '해운대구 송정동, 좌동 일원', '2018-12-24', '2020-06-23', '유량조정조 V=3,000㎥, 압송관로 L=3.13㎞ 등', 'B02', '051-888-6257', '97.2억원', 35.16310231, 129.163619);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(232, 232, '부산시민회관 지붕개선 및 무대자동화사업', 2056, 516, 2572, 100, 100, 100, 'F05', '동구 자성로 133번길 16, 부산시민회관', '2019-01-01', '2020-05-31', '연면적 14,929.08㎡, 지하1층/지상4층rn※ 무대자동화 사업은 기계1팀에서 별도 시행', 'B03', '051-888-6336,051-888-6354', '37억원', 35.13885178, 129.0650555);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(233, 233, '하수관로 확충 \[보덕포 상류 일원]', 1067, 1505, 2572, 100, 100, 100, 'F07', '사하구 장림동 일원 (보덕포상류 및 장림시장 일원)', '2019-01-01', '2023-02-14', '하수관로(D80∼400㎜) L=7.`84㎞, 배수설비 1,618가구rn', 'B02', '051-888-6244', '297억원(공사267,기타30) ▷국비 74, 시비 223', 35.08104599, 128.9656114);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(234, 234, '남부 하수 찌꺼기 감량화시설 개량사업', 1538, 1033, 2571, 100, 100, 100, 'F03', '남구 이기대로 11(남부하수처리장 내)', '2019-01-02', '2021-10-31', '소화가스 발전설비(600kW) 설치 1식', 'B03', '051-888-6354', '86.21억원', 35.1261944, 129.1149725);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(235, 235, '삼한맨션\~과정교차로간 도로건설', 1774, 789, 2563, 100, 100, 100, 'F01', '동래구 수안동 삼한맨션\~연제구 거제동 과정교차로', '2019-01-10', '2021-03-09', '󰏚 사업개요 rn  ❍ 필 요 성 : 교통정체가 극심한 도심지 교통난 해소 및 지역균형개발 촉진rn  ❍ 구    간 : 동래구 수안동 삼한맨션\~연제구 거제동 과정교차로rn  ❍ 사업규모 : 도로개설 L=400m,', 'B01', '051-888-6424', '190억원', 35.19504711, 129.0871817);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(236, 236, '하수관로신설(확충)공사\[남부처리구역(동천수계일원)]', 1089, 1474, 2563, 100, 100, 100, 'F07', '부산진구 당감동․동구 안창마을․남구 문현동', '2019-01-10', '2023-01-23', '오수관로설치 L=12.948km, 배수설비 N=1,384개소', 'B02', '051-888-6247', '396억원(공사270, 감리17 등 )  국비 110  시비 286', 35.13587906, 129.0692148);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(237, 237, '동부산공공하수처리시설 설치공사', 562, 1979, 2541, 100, 100, 100, 'F03', '기장군 장안읍 좌동리 산64-4번지 일원', '2019-02-01', '2024-07-03', '하수처리시설 Q=5,000㎥/일, 방류관로 L=350m', 'B02', '051-888-6224', '35,498백만원 (국비 10,419, 시비 10,419, 원인자 14,660)', 35.31560129, 129.2470513);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(238, 238, '동부산하수처리구역 오수관로 설치공사', 908, 1439, 2347, 100, 100, 100, 'F07', '부산광역시 기장군 장안읍, 임랑, 월내 일원', '2019-08-14', '2023-07-23', '분류식 오수관로 신설(D80\~600㎜, L=23.4㎞),  배수설비 1,315가구, 중계펌프장 1개소', 'B02', '051-888-6254', '498억원', 35.31616934, 129.2436369);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(239, 239, '수영처리구역 오수관로 정비사업 1단계(온천천 일원)', 2011, 331, 2342, 100, 100, 100, 'F07', '금정구, 동래구 온천천일원', '2019-08-19', '2020-07-15', '비굴착(D900\~1200mm) 전체보수 L=3.34㎞rn비굴착(D500\~1200mm) 부분보수 85개소 등', 'B02', '051-888-6257', '72억원(공사 6,519, 감리 558, 기타 200)', 35.20561394, 129.078493);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(240, 240, '부산 어린이 VR 재난안전체험 교육장 건립', 2153, 179, 2332, 100, 100, 100, 'F05', '수영구 광안동 1034-4번지 고가도로 밑', '2019-08-29', '2020-02-24', '1개동, 지상2층, 연면적 391.48m², 제2종근린생활시설', 'B03', '051-888-6331', '20억원', 35.16977015, 129.1084844);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(241, 241, '동김해IC\~식만JCT간 광역도로 건설', 427, 1827, 2254, 100, 100, 100, 'F01', '김해시 어방동(동김해IC)∼강서구 식만동(식만JCT)', '2019-11-15', '2024-11-15', '도로개설 L=4.6km, B=20∼35.5m', 'B01', '051-888-6421', '897억원(공사 555, 보상 296, 기타 46) ▷ 국비 419.7, 시비 419.8', 35.22341003, 128.9061778);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(242, 242, '만덕\~센텀 도시고속화도로 건설', 49, 2191, 2240, 84, 74.4, 94.76, 'F01', '북구 만덕동(만덕대로)～해운대구 재송동(수영강변대로)', '2019-11-29', '2025-11-28', '지하도로 L=9,620m, B=11\~27.5m(왕복 4차로), IC 3개소', 'B01', '051-888-6154,051-888-6156,051-888-6157', '7,901억원(공사 6,552, 감리 187, 보상 202, 기타 960)', 35.21307359, 129.0319063);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(243, 243, '부산광역시 농업기술센터 건립공사', 1567, 669, 2236, 100, 100, 100, 'F05', '강서구 공항로 1285(현 위치)', '2019-12-03', '2021-10-02', '부지면적 8,062㎡, 연면적 5,757㎡, 지상4층 2개동', 'B03', '051-888-6315', '199억원', 35.21360819, 128.9866794);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(244, 244, '해운대 소각시설 대보수사업', 1246, 973, 2219, 100, 100, 100, 'F04', '해운대구 해운대로 898(부산환경공단 해운대사업소)', '2019-12-20', '2022-08-19', '소각시설 200톤/일(생활폐기물 190톤, 건조슬러지 10톤)', 'B03', '051-888-6352', '435.71억원', 35.17484071, 129.1843876);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(245, 245, '남항 항만시설물(계류시설) 내진보강 공사', 1118, 1095, 2213, 100, 100, 100, 'F08', '부산남항(중구,서구 물양장, 영도굴항) 일원', '2019-12-26', '2022-12-25', '내진보강(그라우팅) L=2,301m, 천공 3,529공, 약액주입 9,201공', 'B01', '051-888-6161', '17,069백만원', 35.09465924, 129.0254984);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(246, 246, '드론산업 허브센터 구축', 412, 1795, 2207, 100, 100, 100, 'F05', '부산광역시 강서구 지사동 1277번지', '2020-01-01', '2024-11-30', '지상4층, 연면적 1,811.9㎡, 공작물 563.2㎡', 'B03', '051-888-6332', '93.85억원', 35.14521062, 128.8244666);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(247, 247, '하수관로 신설(확충)공사 (북구제척지 일원)', 40, 2009, 1969, 71.4, 73.1, 97.67, 'F07', '북구 제척지 일원', '2020-08-26', '2026-02-25', '하수관로(D=80\~350㎜) L=15.803㎞, 배수설비 1,862가구', 'B02', '051-888-6246', '401억원', 35.23199751, 129.0125208);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(248, 248, '하수관로 신설(확충)공사 (사상구제척지 일원)', 99, 2068, 1969, 67.67, 67.67, 100, 'F07', '사상구 강변처리구역 내 제척지 일원(정비사업 해제지 등)', '2020-08-26', '2026-04-25', '하수관로(D80\~250mm) L=21.330km, 배수설비 3,155가구', 'B02', '051-888-6245', '453억원', 35.16536788, 128.9850661);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(249, 249, '수영처리구역(온천천) 오수관로 정비사업 2차', 1418, 496, 1914, 100, 100, 100, 'F07', NULL, '2020-10-20', '2022-02-28', '오수관로(D1,200\~D1,500mm) 비굴착 전체보수 L=3.286km', 'B02', '051-888-6254', '106억원(공사 9,215백만원, 감리 1,378백만원)', 35.19402962, 129.0897465);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(250, 250, '수영처리구역(온천천) 오수관로 정비사업 3차', 1381, 533, 1914, 100, 100, 100, 'F07', NULL, '2020-10-20', '2022-04-06', '오수관로(D1,200\~1,500mm) 비굴착 전체보수 L= 1.639km', 'B02', '051-888-6254', '47억원(공사 4,714백만원)', 35.19763447, 129.0813636);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(251, 251, '분뇨처리시설 현대화사업', 381, 1492, 1873, 100, 100, 100, 'F03', '사상구 낙동대로943번길 157(감전동, 위생처리장 내)', '2020-11-30', '2024-12-31', '부지집약화(지하화) A=14,900㎡rn처리용량 Q=2,100㎥/일rn건축면적 A=2,355.51㎡(지하3층, 지상2층)', 'B02', '051-888-6222', '108,700,000,000원', 35.13837506, 128.9681025);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(252, 252, '동부산권 수소버스충전소 구축', 1120, 742, 1862, 100, 100, 100, 'F05', '기장군 기장읍 청강리 416번지 청강리공영차고지', '2020-12-11', '2022-12-23', '지상1층, 3동, 연면적 563㎡, 충전시설', 'B03', '051-888-6355', '67억원', 35.22379978, 129.2126262);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(253, 253, '신평장림 산업단지 혁신지원센터 건립', 1112, 746, 1858, 100, 100, 100, 'F05', '사하구 장림동 1080-3', '2020-12-15', '2022-12-31', '부지 1,650m² ,  지상5층, 연면적 2,844.44m²', 'B03', '051-888-6315', '105억원', 35.10441526, 128.9749453);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(254, 254, '수산식품특화단지 기업지원센터 건립공사', 1022, 835, 1857, 100, 100, 100, 'F05', '사하구 장림동 1082-8번지', '2020-12-16', '2023-03-31', '부지면적 2,598.1㎡, 연면적 5,236.78㎡, 지하1층/지상4층', 'B03', '051-888-6334', '132억원', 35.08089966, 128.959063);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(255, 255, '우암부두 지식산업센터 건립', 1054, 791, 1845, 100, 100, 60, 'F05', '남구 우암동 265-1번지 외 1', '2020-12-28', '2023-02-27', '부지면적 6,000㎡, 연면적 9,306.48㎡, 지상6층', 'B03', '051-888-6315', '228.57억원', 35.12101537, 129.0778435);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(256, 256, '부산시립미술관 리모델링', 134, 1975, 1841, 45.9, 46.4, 98.92, 'F05', '부산광역시 해운대구 우동 1413번지 외 3필지', '2021-01-01', '2026-05-30', '지하2/지상3층, 연면적 22,297.3㎡(기존 21,426㎡, 증축 871㎡)', 'B03', '051-888-6312', '456억원', 35.16667527, 129.136981);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(257, 257, '50+복합지원센터 건립사업', 116, 1957, 1841, 52, 52, 100, 'F05', '부산광역시 동래구 낙민동 127-4번지 일원', '2021-01-01', '2026-05-12', '󰏚 사업개요(2021\~2026)rn ㅇ 추진배경 : 신중년의 재취업, 창업, 여가․커뮤니티 활동 등 종합플랫폼 구축rn ㅇ 위    치 : 동래구 낙민동 127-8번지 일원rn ㅇ 규   모 : 지상4층, 연면적 3,038.8㎡, 노유', 'B03', '051-888-6335', '196억원', 35.19762676, 129.0912219);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(259, 259, '식만\~사상간(대저대교) 도로건설', 1690, 3521, 1831, 3, 3, 100, 'F01', '강서구 식만동(식만JCT)\~사상구 삼락동(사상공단)', '2021-01-11', '2030-09-02', '도로건설 L=8,240m, B=20m', 'B01', '051-888-6412,051-888-6416', '3,934억원', 35.18764669, 128.9606237);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(260, 260, '북구지역 소방서 구축사업', 911, 850, 1761, 100, 100, 100, 'F05', '부산광역시 북구 금곡대로616번길 151 외2', '2021-03-22', '2023-07-20', '지하2층/지상8층, 연면적 6,604.35㎡', 'B03', '051-888-6332', '196.2억원', 35.26200457, 129.014779);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(261, 261, '부산남항 서방파제 재해취약지구 정비사업', 234, 1925, 1691, 76.4, 73.3, 104.23, 'F01', '서구 남부민동 서방파제(남부민방파제) 전면해상', '2021-05-31', '2026-09-07', '방파제 확충 L=365m, B=25→65m(증 40m)', 'B01', '051-888-6202,051-888-6205', '460억원', 35.08573069, 129.028605);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(262, 262, '하수관로 신설(확충)공사 (신평동 일원)', 578, 1097, 1675, 100, 100, 100, 'F07', '사하구 신평동 일원', '2021-06-16', '2024-06-17', '하수관로(D=150\~200㎜) L=5.6㎞, 배수설비 1,270가구(정화조 폐쇄 포함)', 'B02', '051-888-6247', '191억원', 35.09215731, 128.9761627);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(263, 263, '하수관로 신설(확충)공사 (대저처리분구 일원)', 349, 1989, 1640, 31.62, 32.17, 98.29, 'F07', '강서구 대저동 일원', '2021-07-21', '2026-12-31', '하수관로(D=80\~200㎜) L=23.1㎞, 배수설비 1,067가구', 'B02', '051-888-6241', '486억원', 35.1749083, 128.954786);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(264, 264, '공중화장실 배수설비 연결 정비공사', 1275, 364, 1639, 100, 100, 100, 'F07', '14개 구군 공중화장실(북구, 중구 제외)', '2021-07-22', '2022-07-21', '오수관로 (D80\~D250 L=3.17km), 배수설비 48개소', 'B02', '051-888-6258', '4,841벡만원', 35.17965041, 129.07489);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(265, 265, '강서 시내버스 공영차고지 조성사업(토목)', 1023, 608, 1631, 100, 100, 100, 'F08', '부산광역시 강서구 화전동 산74번지 일원', '2021-07-30', '2023-03-30', '차고지 조성 A=50,140㎡', 'B02', '051-888--6225', '160억 원', 35.10110759, 128.8663487);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(266, 266, '부산복합혁신센터 건립공사', 402, 1226, 1628, 100, 100, 100, 'F05', '동삼 혁신지구내 (영도구 동삼동 1158번지)', '2021-08-02', '2024-12-10', '- 부지면적 5,132㎡ , 연면적 4,339.71㎡, 지하2층, 지상3층rn- 제1,2종 근린생활시설', 'B03', '051-888-6316', '191.2억원(공사비 165.8, 설계․감리․부대비 등 25.4)', 35.07480073, 129.074325);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(267, 267, '하수관로 신설(확장)공사\[수영처리구역(양정동 제척지 일원)]', 503, 1095, 1598, 100, 100, 100, 'F03', '부산진구 양정동, 연제구 연산동 일원', '2021-09-01', '2024-08-31', '오수관로(D150\~500mm), L=11.987km, 배수설비 1,130가구', 'B02', '051-888-6255', '270억원(공사 244, 기타 26)', 35.17191887, 129.0738155);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(268, 268, '수영처리구역(수영강) 오수관로 정비사업', 847, 729, 1576, 100, 100, 100, 'F07', '수영강 일원(금정구 회동동\~부산환경공단 수영사업소)', '2021-09-23', '2023-09-22', '오수관로(D600\~1,500mm) 비굴착 전체보수 L=4.0km', 'B02', '051-888-6252', '91억원(공사 7,941 감리 747 기타 400)', 35.19963198, 129.1158433);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(269, 269, '하수관로 확충(하단분구 BTL)', 428, 1095, 1523, 100, 100, 100, 'F07', '사하구 하단동, 괴정동, 당리동 일원', '2021-11-15', '2024-11-14', '하수관로 L=74,763m, 배수설비 N=6,280가구 등', 'B02', '051-888-6244', '773억원', 35.09959769, 128.9829928);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(270, 270, '수영처리구역(온천천) 오수관로 정비사업 4차', 898, 607, 1505, 100, 100, 100, 'F07', '동래구, 연제구 온천천 우안 일원(연안교\~한양APT)', '2021-12-03', '2023-08-02', '오수관로(D2,000mm) 비굴착 전체보수 L=1.297km', 'B02', '051-888-6252', '106억원(공사 9,527백만원, 감리 1,078백만원)', 35.19179334, 129.0981638);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(271, 271, '하수관로 신설(확충)사업\[동삼·청학동 일원]', 710, 2189, 1479, 16, 15.5, 103.23, 'F07', '영도구 동삼동, 청학동 일원', '2021-12-29', '2027-12-27', '하수관로(D80\~400) L=26.862Km, 배수설비 2,373개소', 'B02', '051-888-6244', '499억원', 35.07321212, 129.0723665);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(272, 272, '벡스코 제3전시장 건립사업', 1445, 2921, 1476, 0, 0, 0, 'F05', '부산광역시 해운대구 우동 1500번지', '2022-01-01', '2029-12-31', '부지면적 24,150㎡, 연면적 58,809.97㎡, 지하1/지상4층', 'B03', '051-888-6312', '2,900억원', 35.16869326, 129.1349706);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(273, 273, '수산식품산업 클러스터 조성사업', 1080, 2556, 1476, NULL, NULL, NULL, 'F05', '암남동 620-2외 2필지', '2022-01-01', '2028-12-31', '지하1층/지상5층, 2개동, 연면적 17,978㎡', 'B03', '888-6332', '812.62억원', 35.0623533, 129.0151424);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(274, 274, '친환경 수소연료선박 R\&D 플랫폼 센터 건립', 952, 515, 1467, 100, 100, 100, 'F05', '남구 우암동 300번지', '2022-01-10', '2023-06-09', '부지면적 5,000㎡, 연면적 2,911.44㎡, 지상4층', 'B03', '051-888-6335', '88.47억원', 35.12129051, 129.0770389);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(275, 275, '사상역 광역환승센터 건설공사', 312, 1148, 1460, 100, 100, 100, 'F01', '지하철 2호선 사상역 출입구 일원 및 부전-마산선 환승통로', '2022-01-17', '2025-03-10', '진출입구 개선 5개소(에스컬레이트 3개소, 엘리베이터 1개소, 무빙워크 1개소)', 'B01', '051-888-6415', '21,355백만원', 35.16218766, 128.9855594);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(276, 276, '소방학교 야외훈련장조성사업', 595, 862, 1457, 100, 100, 100, 'F08', '금곡동 산1105-2', '2022-01-20', '2024-05-31', '야외훈련장 조성 A=13,546m2', 'B02', '051-888-6227', '9870백만원', 35.26895966, 129.0202915);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(277, 277, '온천5호교 재가설(확장)공사', 301, 1690, 1389, 21, 22.57, 95.21, 'F01', '부산광역시 금정구 부곡동 454-23(온천5호교) 일원', '2022-03-29', '2026-11-13', '교량 재가설(확장) L=160m, B=35→50m, 접속도로 L=380m, B=35→50m', 'B01', '051-888-6415', '501억원', 35.22506568, 129.0886753);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(278, 278, '반다비 체육센터 건립', 653, 2039, 1386, 0, 0, 0, 'F05', '부산광역시 해운대구 좌동 1404번지', '2022-04-01', '2027-10-31', '지하1/지상2층, 1개동 rn연면적 4,338.08㎡(증축) (컬링장, 체육관 등)', 'B03', '051-888-6316', '172억원', 35.18046962, 129.1765588);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(279, 279, '돌제부두 전면 물양장 확충사업', 14, 1367, 1353, 76.4, 73.3, 104.23, 'F01', '서구 충무대로 202 일원(공동어시장 일원 전면해상)', '2022-05-04', '2026-01-30', '물양장 확충 L=100m(양측), B=80m(A=4,000㎡)', 'B01', '051-888-6205', '88.9억원', 35.08776103, 129.027367);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(280, 280, '해안새벽시장 전면 물양장 확충사업', 714, 2027, 1313, 0, 0, 0, 'F07', '부산광역시 서구 충무동1가 45', '2022-06-13', '2027-12-31', '물양장 확충 L=355m, B=4\~20m', 'B01', '051-888-6161', '26,160,000,000', 35.09339518, 129.0256426);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(281, 281, '덕천(화명)\~양산간 도로교통체계 개선공사', 408, 1683, 1275, 60, 60, 79.37, 'F01', '부산광역시 북구 덕천동 597번지 일원', '2022-07-21', '2027-02-28', '도로개설 L=1.2㎞, B=4.5mrn(교량2개소 L=278m)', 'B01', '051-888-6184\~5', '25,109백만원', 35.22460408, 129.0051559);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(282, 282, '부산근현대역사박물관 조성 3단계 사업', 819, 438, 1257, 100, 100, 100, 'F05', '중구 대청로 112, 대청동 1가44 일원', '2022-08-08', '2023-10-20', '구)한국은행부산본부 증축+현)부산근대역사관 외부조성rn - 구)한국은행부산본부 : 지하1층/지상5층, 연면적 6,900.37㎡(증축358.73㎡포함)rn - 현)부산근대역사관 : 지하1층/지상3층, 연면적 2,196.05㎡', 'B03', '518886317', '112.32억원', 35.10257281, 129.0318843);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(283, 283, '학교 분류식하수관로 연결사업(북부, 동래지원청 일원)', 224, 1460, 1236, 33.5, 33.5, 100, 'F07', '북구, 동래지원청 일원', '2022-08-29', '2026-08-28', '하수관로 L=55.551kmrn배수설비 148개교', 'B02', '051-888-6252', '49,045백만원', 35.17975625, 129.0750244);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(284, 284, '학교 분류식하수관로 연결사업(남부, 해운대지원청 일원)', 224, 1460, 1236, 36.1, 35.8, 100.84, 'F07', '남부 및 해운대지원청 일원(남구, 동구, 부산진구, 수영구. 해운대구, 기장군)', '2022-08-29', '2026-08-28', '오수관로(D80\~500mm) L=64.4km,  배수설비 145개교', 'B02', '051-888-6256', '499억원(공사 442, 감리 40, 기타17)', 35.14564494, 129.1132157);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(285, 285, '하수관로 신설공사\[남부처리구역(광안, 남천동 일원)]', 224, 1460, 1236, 55.27, 52.07, 106.15, 'F07', '수영구 광안동, 남천동', '2022-08-29', '2026-08-28', '하수관로 신설 L=22.915km   배수설비 정비 N=1,698가구', 'B02', '051-888-6246', '480억원', 35.14863312, 129.1134247);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(286, 286, '파워반도체 상용화센터 환경부대시설 증축공사', 1053, 173, 1226, 100, 100, 100, 'F05', '부산광역시 기장군 장안읍 임랑리 산105-2외 2', '2022-09-08', '2023-02-28', '연면적 283.03㎡, 지상 1층, 별동증축, 교육연구시설', 'B03', '051-888-6331', '19.6억원', 35.32457745, 129.2508622);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(287, 287, '학교 분류식하수관로 연결공사(서부지원청 일원)', 254, 1459, 1205, 52.97, 52.18, 101.67, 'F07', '부산광역시 중구, 서구, 영도구, 사하구 일원', '2022-09-29', '2026-09-27', '오수관로 L=41.650km, 배수설비 84개교', 'B02', '051-888-6245', '49,860백만원', 35.07972103, 129.0732766);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(288, 288, '태풍 힌남노 피해 남항 항만시설물 응급복구공사', 1012, 160, 1172, 100, 100, 100, 'F08', '부산광역시 서구 충무동1가 45', '2022-11-01', '2023-04-10', '계류시설(콘크리트블록) 복구 L=52m', 'B01', '051-888-6161', '950000000', 35.0945879, 129.0254528);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(289, 289, '동천 지방하천 정비사업', 656, 467, 1123, 100, 100, 100, 'F08', '동천 자성대노인복지관 하구교 일원', '2022-12-20', '2024-03-31', '보도교 재가설 L=48m, B=3.5m, 홍수방어벽 설치 L=269m', 'B01', NULL, '3100백만원', 35.13594418, 129.0653989);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(290, 290, '노후하수관로정비사업3-1단계(신시가처리분구 일원)', 527, 590, 1117, 100, 100, 100, 'F07', '해운대구 장산역 일원', '2022-12-26', '2024-08-07', '노후하수관로(D250\~900mm) 정비 L=4.1kmrn', 'B02', '051-888-6246', '7520백만원', 35.1694229, 129.1759899);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(291, 291, '민주공원 부속건물 건립공사', 398, 715, 1113, 100, 100, 100, 'F05', '부산광역시 서구 동대신동2가 99-13번지 외 4필지', '2022-12-30', '2024-12-14', '부지면적 3,582㎡, 연면적 2,191.1㎡, 지하2층/지상3층', 'B03', '051-888-6312', '158억원', 35.11027885, 129.0269816);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(292, 292, '광안대교 접속도로 연결공사', 12, 1094, 1106, 86.2, 86.2, 100, 'F01', '벡스코 요금소 \~ 센텀시티 지하차도 연결', '2023-01-06', '2026-01-04', 'RAMP교 L=276m, B=6.5m(1차로)rnUNDER-PASS L=284m, B=5∼16m(1∼4차로)', 'B01', '051-888-6181', '41,217백만원', 35.16444598, 129.132577);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(293, 293, '수영강 휴먼브리지 조성', 32, 1134, 1102, 87, 90.3, 96.35, 'F01', '해운대구 영화의 전당\~수영구 현대, 협성 아파트 일원', '2023-01-10', '2026-02-17', '보행 전용교(L=254m, B=4\~20m) 설치', 'B01', '051-888-6411', '276억원', 35.1699291, 129.1241382);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(294, 294, '탄성소재연구소 건립', 349, 1429, 1080, 30, 30, 100, 'F05', '부산광역시 사상구 삼락동 380-17번지', '2023-02-01', '2026-12-31', '연면적 3,757.11㎡, 지하1/지상5층(연구실, 장비실 등)', 'B03', '051-888-6316', '342.42억원', 35.18119197, 128.9784919);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(295, 295, '하수관로 신설(확충)사업\[수영처리구역(거제,연산동 일원)]', 485, 1460, 975, 26.38, 22.68, 116.31, 'F03', '부산광역시 연제구 거제동, 연산동 일원', '2023-05-17', '2027-05-16', '오수관로 신설(D80\~250㎜) 19.58㎞, 배수설비 N=2,046가구rn', 'B02', '051-888-6256', '47,529백만원', 35.18596847, 129.0816587);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(296, 296, '중앙대로 확장공사', 245, 1163, 918, 51, 53.7, 94.97, 'F01', '동래구 롯데백화점 앞 교차로 \~ 금정구청 앞 교차로(온천5호교 구간 540m 제외)', '2023-07-13', '2026-09-18', '도로확장 L=3,270m, B=35 -> 50m 등', 'B01', '051-888-6182', '362,635백만원', 35.22241137, 129.0868721);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(297, 297, '기장하수처리구역 분류식 관로 정비사업', 349, 1200, 851, 44.08, 46.38, 95.04, 'F03', '부산광역시 기장군 기장읍 일원', '2023-09-18', '2026-12-31', '오수관로 신설 L=3,759m, 노후하수관로 정비 L=3,614m, 배수설비 N=1,822가구', 'B02', '051-888-6256', '24,310백만원', 35.24441151, 129.2188542);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(298, 298, '어린이대공원 진입광장 정비사업(통합관리센터 건립)', 381, 407, 788, 100, 100, 10, 'F05', '부산진구 초읍동 43번지(어린이대공원) 내', '2023-11-20', '2024-12-31', '1개동, 지하1/지상1층, 연면적 499.69㎡, 제1종 근린생활시설(공공업무시설)', 'B03', '518886317', '22억원', 35.18283973, 129.0463447);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(299, 299, '낙동강 하굿둑 상류 대저수문 등 개선사업', 295, 1060, 765, 22.5, 43.3, 51.96, 'F08', '부산시 강서구 대저1동 1-6번지(대저수문 일원)', '2023-12-13', '2026-11-07', '대저수문(취수문, 통선문) 개선 1식', 'B01', '051-888-6422', '310억원', 35.23258072, 128.9936221);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(300, 300, '하수관로 신설(확충)사업(연산처리분구 잔여지 일원)', 708, 1460, 752, 18.2, 15.3, 118.95, 'F03', '부산광역시 연제구 연산동, 수영구 망미동 일원', '2023-12-26', '2027-12-25', '오수관로 신설(D80\~250㎜) 22.296㎞, 배수설비 N=3,383가구', 'B02', '051-888-6254', '48,676백만원', 35.17310821, 129.0968494);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(301, 301, '하수관로 신설(확충)사업(해동초등학교 일원)', 708, 1460, 752, 24.59, 23, 106.91, 'F03', '부산광역시 해운대구 우1동주민센터, 해동초등학교, 해운대 및 송정제척지 일원', '2023-12-26', '2027-12-25', '오수관로(D80\~250㎜) 14.549㎞, 배수설비 N=1,221가구', 'B02', '051-888-6251', '34,537백만원', 35.16443178, 129.1658709);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(302, 302, '하수관로 신설(확충)사업(반송동 일원)', 1074, 1826, 752, 14, 14.5, 96.55, 'F07', '해운대구 반송동 일원', '2023-12-26', '2028-12-25', '오수관로 L=18.246km, 배수설비 N=3,326가구', 'B02', '051-888-6251', '49,062백만원', 35.22463939, 129.1490428);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(303, 303, '하수관로 신설(확충) 사업\[반여,재송동 일원]', 708, 1460, 752, 39.22, 40.97, 95.73, 'F07', '해운대구 반여2동, 재송2동 일원', '2023-12-26', '2027-12-25', '하수관로 신설(D80\~300) L=9,956mrn배수설비 정비 1,282가구rn맨홀펌프장 신설 1개소', 'B02', '051-888-6225', '25,831백만원', 35.19490691, 129.1304036);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(304, 304, '하수관로 신설(확충)사업(재송처리분구 잔여지 일원)', 708, 1460, 752, 21, 21.36, 98.31, 'F07', '해운대구 재송1,2동 및 우2동 일원', '2023-12-26', '2027-12-25', '하수관로(D80\~300㎜) L=22.064㎞, 배수설비 1,925가구', 'B02', '051-888-6225', '42,866백만원', 35.18861026, 129.1256563);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(305, 305, '하수관로 신설(확충)사업(온천천수계 잔여지 일원)', 711, 1460, 749, 14, 14.3, 97.9, 'F03', '부산광역시 금정구 구서동, 부곡동 일원', '2023-12-29', '2027-12-28', '오수관로(D80\~250㎜) 21.09㎞, 배수설비 N=1,721가구', 'B02', '051-888-6255', '44,694백만원', 35.25410254, 129.0875196);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(306, 306, '하수관로 신설(확충)사업\[대교사거리 일원]', 558, 1307, 749, 13.44, 13.33, 100.83, 'F07', '영도구 대교사거리(남항, 영선, 봉래동) 일원', '2023-12-29', '2027-07-28', '하수관로(D80\~250mm)  L=24.149Km, 배수설비 N=2,373개소', 'B02', '051-888-6244', '499억원', 35.09020908, 129.0372295);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(307, 307, '부산마리나 비즈센터 건립공사', 126, 851, 725, 65, 65, 100, 'F05', '남구 우암동  303번지', '2024-01-22', '2026-05-22', '부지면적 20,158㎡, 연면적 9,116㎡, 지상4층, 2개동', 'B03', '051-888-6338', '446억원(공사 및 장비도입비 431, 설계 및 감리비 등 42)', 35.12269021, 129.0689689);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(308, 308, '영화의전당 어린이복합문화공간 조성사업', 553, 130, 683, 100, 100, 100, 'F08', '해운대구 수영강변대로 120, 영화의전당 비프힐 1층', '2024-03-04', '2024-07-12', '영상·영화를 접목한 어린이복합문화공간 조성 리모델링 공사(A=470.39㎡)', 'B03', '518886317', '20억원', 35.17091565, 129.1269734);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(309, 309, '헬스케어 빅데이터센터 건립', 53, 602, 655, 100, 100, 100, 'F05', '부산광역시 강서구 명지동 에코델타시티 공공청사 6블록', '2024-04-01', '2025-11-24', '부지면적 5,220㎡/ 1개동/ 지상3층/ 연면적 3,157.99㎡', 'B03', '518886317', '293.45', 35.12851216, 128.9177735);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(310, 310, '준설물 감량화시설 설치사업 2단계', 319, 974, 655, 80, 80, 100, 'F05', '사하구 을숙도대로 469', '2024-04-01', '2026-12-01', '본 사업은 하수관로 등에서 발생되는 각종 준설물을 폐기물로 처리함에 따라 경제적, 환경적 문제가 야기되어, 준설물을 분리, 선별 등 친환경적인 감량화 과정을 거쳐 재활용하고 하수처리시', 'B03', '051-888-6366', '101억원', 35.08784279, 128.9560277);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(311, 311, '당감·개금권 보행환경 개선사업', 426, 212, 638, 100, 100, 100, 'F01', '부산진구 백양순환로 110번길 일원 외 3개소', '2024-04-18', '2024-11-16', '보도신설·정비 등 L=1.77km, B=1.7\~4.0m', 'B01', '051-888-6425', '23.5억원', 35.15915059, 129.0317491);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(312, 312, '당감·개금권 선형공원 조성공사', 394, 218, 612, 100, 100, 100, 'F01', '부산진구 당감동 818-161번지 일원 외 1개소', '2024-05-14', '2024-12-18', '선형공원 조성 L=370m, B=10\~15m', 'B01', '888-6205', '37.5억원', 35.16289699, 129.0361879);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(313, 313, '에코델타 첨단지식산업센터 건립', 76, 659, 583, 79.1, 73.8, 107.18, 'F05', '부산광역시 강서구 명지동 3021-3번지 일원', '2024-06-12', '2026-04-02', '- 대지면적 5,213㎡, rn- 지상5층rn- 연면적 7,134.74㎡', 'B03', '888-6334', '353.34억원', 35.13003616, 128.918281);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(314, 314, '당감·개금권 15분 자전거길 조성공사', 406, 142, 548, 100, 100, 100, 'F01', '부산진구 개금역 \~ 백양대로 \~ 당감서로', '2024-07-17', '2024-12-06', '자전거·PM 전용도로 조성 L=2.3km', 'B01', '888-6204', '19.5억원', 35.15934398, 129.0320392);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(315, 315, '생곡 쓰레기매립장(2-2단계) 조성공사', 2386, 2919, 533, 18.25, 16.21, 112.58, 'F04', '강서구 생곡동 생곡산단로 90 일원', '2024-08-01', '2032-07-29', '쓰레기 매립 및 복토 V=1,842천㎥', 'B02', '051-888-6225', '437억원', 35.12797145, 128.874004);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(316, 316, '하수관로 신설(확충)공사 (강동처리분구 일원)', 902, 1431, 529, 9.01, 9.36, 96.26, 'F07', '강서구 강동동 일원', '2024-08-05', '2028-07-06', '하수관로(D80\~250)  L=15.267Km, 배수설비 921개소', 'B02', '051-888-6242', '292억원', 35.20579403, 128.9259687);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(317, 317, '해양과학기술 산학연 협력센터 건립', 51, 440, 491, 97, 97, 100, 'F05', '영도구 동삼동 1163번지 일원', '2024-09-12', '2025-11-26', '- 대지면적rn- 지하1층, 지상7층rn- 연면적 (10,386 ㎡)rn- 교육연구시설(연구소)', 'B03', '888-6337', '322.51', 35.08014424, 129.0767186);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(318, 318, '지반침하대응 노후하수관로 정비사업(3-1단계)(오수관로 2차)', 62, 540, 478, 26.3, 26.8, 98.13, 'F03', '부산시 강변, 동부 및 수영처리구역', '2024-09-25', '2026-03-19', '오수관로(D250\~1,000㎜) L=8.427km', 'B02', '051-888-6254', '98.2억원', 35.15771735, 128.9298383);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(319, 319, '하수관로 신설(확충)공사 (가락처리분구 일원)', 1366, 1825, 459, 4.01, 4.08, 98.28, 'F07', '강서구 가락동 일원', '2024-10-14', '2029-10-13', '하수관로(D80\~250) L=22.651Km, 배수설비 1,108개소', 'B02', '051-888-6242', '497억원', 35.1969289, 128.8949753);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(320, 320, '노후하수관로 정비사업 3-1단계(오수관로1차)', 89, 537, 448, 44.4, 45.9, 96.73, 'F07', '부산시 녹산·신호·남부·수영·중앙 처리구역 일원', '2024-10-25', '2026-04-15', '노후 하수관로 정비 L=10.457Km', 'B02', '051-888-6241', '109억원', 35.17961213, 129.0750207);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(321, 321, '하수관로 신설(확충)사업(윗반송 일원)', 1076, 1521, 445, 8.32, 8.33, 99.88, 'F07', '부산광역시 해운대구 반송동 62-610번지 일원', '2024-10-28', '2028-12-27', '하수관로 L=19.659㎞(D80mm\~D400mm), 배수설비 2,683개소', 'B02', '051-888-6227', '474억원', 35.23166595, 129.1562626);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(322, 322, '동천 해수도수관로 정비 및 준설공사', 165, 608, 443, 65, 60, 108.33, 'F08', '동천 광무교\~범일교 일원', '2024-10-30', '2026-06-30', 'GRP관로보수 L=575m, 하상준설 V=4,740㎥', 'B01', '051-888-6417', '5,100백만원', 35.14759102, 129.0630601);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(323, 323, '엄궁대교 건설공사', 1461, 1855, 394, 3.69, 3.69, 100, 'F01', '강서구 대저동 \~ 사상구 엄궁동', '2024-12-18', '2030-01-16', '도로건설 rnL=2.91㎞, B=24.5\~33.5m', 'B01', '051-888-6422,051-888-6424', '3,431억원', 35.12684818, 128.9553477);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(324, 324, '영도 수리조선 혁신기술센터 건립', 360, 745, 385, 2, 2, 100, 'F05', '영도구 대평동1가 37번지 외 1필지', '2024-12-27', '2027-01-11', '1개동, 지상 8층, 연면적 2,786.38㎡, 교육연구시설(연구소)', 'B03', '051-888-6315', '230억원', 35.09187957, 129.034349);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(325, 325, '부산노인전문제2병원 그린리모델링 사업', 156, 205, 361, 100, 100, 100, 'F05', '부산광역시 연제구 월드컵대로 359', '2025-01-20', '2025-08-13', '지하1/지상4층, 연면적 4,939.08㎡, 의료시설rn지붕 내단열 보강, 창호교체, 천장 마감재 교체 등', 'B03', '051-888-6331', '36.87억원', 35.18731986, 129.0600795);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(326, 326, '부산 업사이클센터 건립사업 건축공사', 103, 380, 277, 16, 24, 66.67, 'F05', '서구 암남동 산89번지 일원', '2025-04-14', '2026-04-29', '연면적 809.1㎡, 지하1층/지상4층', 'B03', '051-888-6317', '44.49억원', 35.07529528, 129.0085655);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(327, 327, '시민공원 광장부지 임시주차장 조성사업', 153, 73, 226, 100, 100, 100, 'F08', '부산광역시 시민공원 광장부지(범전동 110번지 일원)', '2025-06-04', '2025-08-16', '임시주차장 약 90면 조성', 'B02', '051-888-6227', '7억원', 35.16601962, 129.0598931);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(328, 328, '동부중소유통공동도매물류센터 증축사업', 25, 119, 144, 50, 50, 100, 'F05', '금정구 반송로490번길 12-19', '2025-08-25', '2025-12-22', 'ㅇ 추진배경 : 동부중소유통공동도매물류센터의 이용 점포 및 물량 증가로인한, 진열공간 부족 해소와 이용 점포의 다양한 요구 충족을 위해 증축 추진, 이를 통한 물류센터 활성화 및 동네상', 'B03', '888-6337', '3.3억원', 35.21530784, 129.1165906);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(329, 329, '부산글로벌빌리지 들락날락 조성사업', 26, 90, 116, 14, 14, 100, 'F05', '부산진구 가야대로 734', '2025-09-22', '2025-12-21', 'ㅇ 추진배경 : 부산글로벌빌리지 1층 노후 홍보관 내 디지털영어학습콘텐츠 중심 어린이복합문화공간 들락날락 조성 및 휴식과독서를 함께 즐길 수 있는 가족복합문화공간 조성rn ㅇ 위    치', 'B03', '051-888-6331', '10억원', 35.15703786, 129.0544215);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(330, 330, '만덕초읍(아시아드)터널 주변 도로시설물 정비', 104, 181, 77, 0, 0, 0, 'F01', '북구 덕천동 함박봉로', '2025-10-31', '2026-04-30', '방음시설 정비(상부개방형→밀폐형) L=309m 등', 'B01', '888-6204', '28억원', 35.20512237, 129.0331575);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(331, 331, '명례일반산업단지 공공폐수처리시설 (2단계) 설치사업', 714, 788, 74, 0, 0, 0, 'F03', '기장군 장안읍 명례산단 내', '2025-11-03', '2027-12-31', '폐수처리시설 Q=1,700㎥/일', 'B02', '051-888-6224', '114억원', 35.2444181, 129.2224221);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(332, 332, '부산진해경제자유구역 북측 진입도로(장낙대교) 건설', 1780, 1817, 37, 0, 0, 0, 'F01', '강서구 생곡동 \~ 명지동 에코델타시티', '2025-12-10', '2030-12-01', '도로건설 L=1.53㎞(교량 1.02㎞), B=24.5\~27.1m(왕복 6차로)', 'B01', '051-888-6421,051-888-6425', '1,748억원', 35.12833721, 128.907162);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(333, 333, '사상 숲체험교육관 건립사업', 529, 546, 17, NULL, NULL, NULL, 'F05', '괘법동 116번지 일원(사상공원 내)', '2025-12-30', '2027-06-29', '- 위치 : 사상구 괘법동 116번지 일원(사상공원 내)rn- 규모 : 지상3층, 연면적 1,861.09㎡, 교육연구시설rn- 사업기간 : 2022\~2027rn- 2025년 12월 착공 예정', 'B03', '051-888-6334', '155', 35.16180177, 128.9914978);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(334, 334, '부산공동어시장 현대화 사업', 1415, 1431, 16, 0, 0, 0, 'F05', '서구 충무대로 202(남부민동)', '2025-12-31', '2029-12-01', '지하1\~지상5층, 연면적 61,971', 'B03', '051-888-6334', '2,412억원', 35.09157568, 129.0223521);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(335, 335, '에덴유원지 조성사업 솔바람 문화센터 건립', 349, 364, 15, 0, 0, 0, 'F05', '사하구 하단동 786-1번지 일원', '2026-01-01', '2026-12-31', '지상2층, 연면적 837.02㎡, 제1종 근린생활시설(카페, 어린이복합문화공간)', 'B03', '518886317', '36억원', 35.1097754, 128.9623039);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(336, 336, 'SMR 보조기기 제작지원센터 건립', 407, 422, 15, NULL, NULL, NULL, 'F05', '강서구 미음동 1529-5번지', '2026-01-01', '2027-02-27', '연면적 2,308㎡, 지상2층rnrn-2025년 12월 공사추진 예정', 'B03', '051-888-6334', '126억원', 35.16267784, 128.8669206);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(337, 337, '부산시민공원 지하주차장 건립', 746, 730, -16, 0, 0, 0, 'F05', '부산진구 연지동 60번지 부산시민공원 내(시민사랑채 북측)', '2026-02-01', '2028-02-01', '지하3층/지상1층, 연면적 14,480㎡, 주차장 400대', 'B03', '051-888-6315', '150억원', 35.17091398, 129.058771);

INSERT INTO test.busan\_construction\_raw

(fid, seq\_no, construction\_name, d\_day, total\_days, elapsed\_days, progress\_rate, plan\_rate, achievement\_rate, field\_code, location\_text, start\_date, end\_date, summary, dept\_code, contact, budget\_text, lat, lon)

VALUES(338, 338, '부산박물관 시설개선사업', 1112, 731, -381, 0, 0, 0, 'F05', '남구 유엔평화로 63 일원(부산박물관 내)', '2027-02-01', '2029-02-01', 'ㅇ 규    모 : 지하1층/지상3층, 연면적 19,207.30㎡(증축 4,196.53㎡)rn ㅇ 용    도 : 문화 및 집회시설(박물관)', 'B03', '051-888-6315', '288억원', 35.12965185, 129.0943961);

