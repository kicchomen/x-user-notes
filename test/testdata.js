const TEST_DATA = [
  [
    "https://pbs.twimg.com/profile_images/1460491311237431296/h03xGfZE_400x400.jpg",
    "Mr. Friend",
    "friend",
    "I am your friend.",
  ],
  [
    "https://pbs.twimg.com/profile_images/1460491311237431296/h03xGfZE_400x400.jpg",
    "Ms. Test",
    "test",
    "I am your test.",
  ],
  [
    "https://pbs.twimg.com/profile_images/1460491311237431296/h03xGfZE_400x400.jpg",
    "Mrs. Sample",
    "sample",
    "I am your sample.",
  ],
  [
    "https://pbs.twimg.com/profile_images/1460491311237431296/h03xGfZE_400x400.jpg",
    "Anything",
    "anything",
    "I am your anything.",
  ],
  [
    "https://pbs.twimg.com/profile_images/1460491311237431296/h03xGfZE_400x400.jpg",
    "Something",
    "something",
    "I am your father.",
  ],
]

document.querySelectorAll('button[data-testid="UserCell"]').forEach((el, index) => {
  const data = TEST_DATA[index]
  // プロフ画像
  const img = el.querySelector('.css-175oi2r.r-1niwhzg.r-vvn4in.r-u6sd8q.r-1p0dtai.r-1pi2tsx.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af.r-13qz1uu.r-1wyyakw.r-4gszlv')
  if (img) img.style.backgroundImage = `url('${data[0]}')`
  // ユーザ名
  const user_name = el.querySelector('.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1tl8opc.r-a023e6.r-rjixqe.r-b88u0q.r-1awozwy.r-6koalj.r-1udh08x.r-3s2u2q')
  if (user_name) user_name.textContent = data[1]
  // ユーザID
  const user_id = el.querySelector('.css-146c3p1.r-dnmrzs.r-1udh08x.r-1udbk01.r-3s2u2q.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41.r-18u37iz.r-1wvb978')
  if (user_id) user_id.textContent = data[2]
  // 紹介文
  const description = el.querySelector('.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-a023e6.r-rjixqe.r-16dba41.r-1h8ys4a.r-1jeg54m')
  if (description) description.textContent = data[3]
})

"https://pbs.twimg.com/profile_images/1391760576167038986/3xfe3HrL_200x200.jpg"
