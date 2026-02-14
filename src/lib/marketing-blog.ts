export type BlogCategory = "parenting" | "product" | "tips";

export type MarketingBlogPost = {
  slug: string;
  category: BlogCategory;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  author: string;
  coverImage?: string;
  bodyEn: string;
  bodyVi: string;
};

const FALLBACK_COVER =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-1_1770730425000_na1fn_YmxvZy1jb3Zlci13aHktd2UtYnVpbHQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTFfMTc3MDczMDQyNTAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTEzYUhrdGQyVXRZblZwYkhRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=TAcYBvg7mOPfA9~yh6aubCdN0isG1v0Ife3~Xpl3lAJlrr5NW7mOOeP~bEMz-p-fkue3~TiuDofy5JJJnAem2TPjjoJdOwxiXuFz6VzyiP5u46VSNqTkNQ2ipvACoMFFH6BpTfGB3E3vV044GQ4Esa0dOxZiK6YGgXq~M7f7IHQSLW21CKYP1Ab1clkuC~0VlbCyqDxoFJ3DUzByEFqp8dD5SYQQN~aP6qvv8QCAIhetDDQrDsg5-Q2ZkDxVxXTYWMitDr1hOWK9TmCNIGV6MjGsV5atfB1qfhddi67ULC370PfpkbhbCN1WxJL4sB4llT3dE8-ZgNTwNdYCkRtZuQ__";

const FALLBACK_SLEEP_COVER =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-2_1770730435000_na1fn_YmxvZy1jb3Zlci1zbGVlcC10cmFja2luZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTJfMTc3MDczMDQzNTAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTF6YkdWbGNDMTBjbUZqYTJsdVp3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=RXiXGgrT7jLFZBoryI1~zSauX0ETveW~BE7ZzGvjZMhOwf0Egi5DjcS-NY01-1yPxVgz1884R4nv49zpX2oRwAR3o~3dZlPLDIDpfcooMYwjLJymGMpCvAldatCINSB2~0X9Mv90CBNVrof5s3FwcoIc-FhIxL2BH8l7ZWPDgg9TKeBl8efLUwGfhC-Fhy9~DEH-tbfeXiXkC5LJcGmuF0npec0y9VpSRl8RIay0rrO56CfoCX-kZ31gUdBg9xa1HSautJaYOfCaCBU6apHy8KOA2OBxkteG8OI-dWMaFCmqwGVNSA-wtP3PfWASbx9DdmVyFUIjY-ZYIO~DgYIKTg__";

const FALLBACK_FEEDING_COVER =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-3_1770730429000_na1fn_YmxvZy1jb3Zlci1mZWVkaW5nLXNjaGVkdWxl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTNfMTc3MDczMDQyOTAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTFtWldWa2FXNW5MWE5qYUdWa2RXeGwucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=YoR0JWBG1rmd6FMu1CRzPexlkSpex1mh5NQZtatcrLG4OTLPaZsHdA9xzArYtpEhNXAuKbHZGoMvwWwKUFkjmID11Btur7vb6JnJ7TNniKIOyO~oTDlg2p-0eJFk8Vt0ujBLkDo7YIfuolOOZ0DsfusnYFvW8HaW54hE4OyZ4mE~n4wXuMWD-5frsko99S9fWu~eTFMIWr4Hz6Wo84FWyiJhXiNWpi9T1kbjWD4r2GohbAtvo17wS5lgcVfPtIgCfnMfoDQ4L4FZ9Ls7dXPeyqss93F-8zuE~vqCoC4WuTJz1HNPhIvmuZey35ULhg8txh5fHAqjw8l-IgvJv~JjNA__";

const FALLBACK_EARLY_ACCESS_COVER =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/TgpJhJHjbsgWGFMxeIbOfd-img-4_1770730427000_na1fn_YmxvZy1jb3Zlci1lYXJseS1hY2Nlc3M.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L1RncEpoSkhqYnNnV0dGTXhlSWJPZmQtaW1nLTRfMTc3MDczMDQyNzAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTFsWVhKc2VTMWhZMk5sYzNNLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=q7PUyCDcyMpvwKzMTVPE0hL1s~B9VC55GAdY1u-V8bxRfnqZtkAbQqS7x1pjiQXHHbcKASiYb8n8yUZi6wAr3cPOUSXVNaJBd7w70fA4kxVBgRxKZCmBwEXRPgohjTGyICuYtZecPLx51xQX-pLpNCSFdyITbR-HoJrttwRkqF5~Uq83G2~fB9m8ZERjmCr9m2dhLSE796iX5kAgbTOPwBPhsWWRjqjh6eP38PVvapUStkHyQbZNsv7~lmdekpHeWqRLZ7xootqi2~tSXEwf6ip6heMzq1sXP1hSfghw04JSDBzZmJivrLBA454RayGVTVpEyebRfuL64J3Mkw-qdg__";

const FALLBACK_TODDLER_COVER =
  "https://private-us-east-1.manuscdn.com/sessionFile/Yqb0N7s7iBUqXrW0bKMS7H/sandbox/ruZCkld1d0nXItuMTQNzYX-img-1_1770731037000_na1fn_YmxvZy1jb3Zlci10b2RkbGVyLW1pbGVzdG9uZXM.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvWXFiME43czdpQlVxWHJXMGJLTVM3SC9zYW5kYm94L3J1WkNrbGQxZDBuWEl0dU1UUU56WVgtaW1nLTFfMTc3MDczMTAzNzAwMF9uYTFmbl9ZbXh2WnkxamIzWmxjaTEwYjJSa2JHVnlMVzFwYkdWemRHOXVaWE0ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=KailNsoH3gD0un08WcP0mLjoY3dlE56M9OARxwOJ3wlDGG~eRTxZ9E~3UN7k1e7EYxLKSMJAuafTAuiL18FpjZOsmjE2wdqTaiy8cuWrODmmWyBuBGw0jr6p7~4miyddInC4VnZ9ywFQ5mQDKxwyx4M3ah3i08Mxeg7A2M-lhpIfKg~lQJfYfWipyqMGQiYuT~Nkt3JemJz-6JUYUiKCWr8DUbMrtt1Pv6hz87IsAbGYIfmZ71yW5NrcpTa2BBHFgrFRcPFubw39i~OHVnDQmnvxGvOccz0~LlI7x7iDkntG~aa3oou9540aAZ99IazetAx9-Jk7pFCh6jbO7GzC8A__";

const MARKETING_BLOG_POSTS: MarketingBlogPost[] = [
  {
    slug: "toddler-milestones-worth-tracking",
    category: "parenting",
    title: "Toddler milestones worth tracking",
    excerpt:
      "First words, first steps, first tantrums — here is what to track and when to bring it up with pediatricians.",
    date: "2026-02-10",
    readTime: 6,
    author: "henrii team",
    coverImage: FALLBACK_TODDLER_COVER,
    bodyEn: `Your baby didn't ask to become a toddler. Somewhere between the midnight feedings and diaper changes, they started pulling themselves up, pointing at things, and developing very strong opinions about bananas.

Welcome to toddlerhood. It can be messy, loud, and full of milestones — some you'll celebrate with tears of joy, others you'll barely notice until someone asks you about them at a checkup.

Here is a grounded guide to what's worth tracking, what's normal variation, and when to bring it up with your pediatrician.

## The milestones that matter most

Here are developmental areas to watch without turning every playdate into an assessment.

### Motor milestones

- 9–12 months: pulling to stand, cruising, and first steps.
- 12–15 months: independent walking.
- 15–18 months: climbing, stacking, self-feeding practice.
- 18–24 months: running, kicking, and climbing everything.

### Language milestones

- 12 months: 1–3 words.
- 15 months: 5–10 words, pointing for wants.
- 18 months: 10–25 words and simple gestures.
- 24 months: 50+ words and two-word phrases.

### Social and emotional milestones

- Separation anxiety (very common).
- Imitating actions.
- Stranger and sibling interactions.
- Pretend play.

### Cognitive milestones

- Object permanence.
- Cause-and-effect experiments.
- Problem solving with simple puzzles.
- Beginning to sort shapes and colors.

What to track: new skills and notes in a simple timeline. You don't need to log every moment, just what feels important.

## What you can relax about

There is a wide range of normal. A baby who walks at 10 months is not necessarily ahead of one who walks at 16 months. A child with fewer words at 18 months is not automatically at risk.

### Commonly normal variation

- late walking within broad range
- temporary picky eating
- temporary regression during major transitions
- strong affection for one parent
- slower sharing milestones

## When to bring it up with your pediatrician

- no words by 16 months
- no two-word phrase by 24 months
- loss of previously learned skills
- not responding to their name consistently
- no eye contact in social situations`,
    bodyVi: `Bạn không cần ghi mọi khoảnh khắc, nhưng nên theo dõi những dấu hiệu quan trọng của bé.

Thông thường trẻ bắt đầu tự đứng dậy, chỉ vào thứ gì đó, và tỏ ra rất rõ ràng khi thích hay không thích.

Dưới đây là các dấu mốc phổ biến của giai đoạn bé tập đi:

## Các mốc vận động

- 9–12 tháng: đứng bằng hai chân, bám vào đồ vật và tập đi chập chững.
- 12–15 tháng: đi không cần bám.
- 15–18 tháng: leo trèo, xếp khối, cầm nắm đồ vật.
- 18–24 tháng: chạy và leo trèo thoải mái hơn.

## Ngôn ngữ

- 12 tháng: 1–3 từ đầu tiên.
- 15 tháng: 5–10 từ, chỉ vào thứ mình muốn.
- 18 tháng: 10–25 từ với cử chỉ kèm theo.
- 24 tháng: 50+ từ, ghép câu ngắn.

Bạn không cần ghi tất cả, chỉ cần ghi các mốc và cảm nhận chính của bé.

### Khi nên lưu ý

- đi bộ muộn vẫn có thể là bình thường
- giai đoạn chấp nhận và từ chối thức ăn là bình thường
- một giai đoạn hồi tưởng kỹ năng cũ rồi thiếu tạm thời
- thay đổi hành vi khi có biến chuyển lớn

## Khi nào nên trao đổi với bác sĩ

- chưa nói được từ đơn lúc 16 tháng
- chưa nói được hai từ khi 24 tháng
- mất kỹ năng đã có trước đó
- không phản hồi tên nhiều lần`,
  },
  {
    slug: "henrii-early-access-announcement",
    category: "product",
    title: "Early access is coming soon",
    excerpt:
      "We're getting close to opening henrii to our first users. Here is what to expect from the early access release.",
    date: "2026-02-09",
    readTime: 3,
    author: "henrii team",
    coverImage: FALLBACK_EARLY_ACCESS_COVER,
    bodyEn: `We're close to opening henrii to first users.

## What's in the early access release

The first version focuses on core tracking:

- Feeding
- Sleep
- Diaper
- Vaccination records

Everything works offline, so you are not blocked by weak connections.

## What comes next

Growth charts, analytics, PDF export, caregiver sharing, and pattern detection.

## Pricing

Core tracking features stay free.
Premium includes growth charts, analytics, and PDF exports.`,
    bodyVi: `Chúng tôi gần ra mắt bản đầu tiên cho người dùng đầu tiên.

## Gói đầu tiên tập trung vào theo dõi cốt lõi:

- Theo dõi bú/ăn
- Theo dõi giấc ngủ
- Theo dõi tã
- Lịch tiêm chủng

Mọi thứ hoạt động cả khi không có mạng.

## Sắp tới

Các tính năng tiếp theo gồm biểu đồ tăng trưởng, phân tích xu hướng, xuất PDF và chia sẻ với người chăm sóc.

## Giá

Tính năng cơ bản vẫn miễn phí.
Gói cao cấp sẽ có biểu đồ tăng trưởng, phân tích và PDF.`,
  },
  {
    slug: "why-we-built-henrii",
    category: "product",
    title: "Why we built henrii",
    excerpt:
      "Every parent has been there — fumbling with a phone at 3am, trying to remember when the last feeding was.",
    date: "2026-02-01",
    readTime: 4,
    author: "henrii team",
    coverImage: FALLBACK_COVER,
    bodyEn: `We built henrii because we were tired of baby tracking apps that make you tap too much.

At 3am, your mind is already overloaded. When your baby wakes up, you need one quick action, not another complex flow.

## The problem

Most tracking apps assume you have time, perfect Wi-Fi, and steady hands. Our needs are the opposite:

- one hand, often sleepy
- incomplete memory after midnight feedings
- fast logging so you can return to caring for your baby

## What we focused on

- one-handed interactions
- offline support when the connection drops
- quick summaries for pediatrician visits
- clear, calm visual language

This is the first step. We are shipping a focused app that helps you capture what matters with minimal friction.`,
    bodyVi: `Chúng tôi xây dựng henrii vì đã mệt mỏi với những app theo dõi bé khiến bạn phải bấm quá nhiều.

Lúc 3 giờ sáng, đầu óc đã quá tải. Khi bé thức dậy, bạn cần một thao tác nhanh, không phải một quy trình phức tạp.

## Vấn đề

Phần lớn ứng dụng theo dõi giả định bạn có thời gian, Wi-Fi ổn định và hai tay đủ tỉnh.
Trong thực tế lại khác:

- chỉ một tay, thường rất buồn ngủ
- trí nhớ không còn rõ sau các lần thức khuya
- cần ghi nhanh để quay lại chăm sóc bé

## Chúng tôi tập trung vào

- thao tác một tay
- dùng được khi không có mạng
- tóm tắt nhanh cho buổi khám bác sĩ
- giao diện dịu, rõ ràng

Đây là bước khởi đầu. Chúng tôi đang làm một app gọn nhẹ giúp bạn ghi lại những điều quan trọng với ma sát thấp nhất.`,
  },
  {
    slug: "newborn-sleep-tracking-guide",
    category: "tips",
    title: "A practical guide to tracking newborn sleep",
    excerpt: "Newborn sleep is unpredictable. Here is how tracking helps you find a gentler rhythm.",
    date: "2026-02-05",
    readTime: 5,
    author: "henrii team",
    coverImage: FALLBACK_SLEEP_COVER,
    bodyEn: `Sleep tracking for newborns is not about optimization.

It helps you answer two simple questions:

1. Is your baby sleeping more during a pattern you can work with?
2. Is there enough signal to share with your pediatrician?

## Keep it light

At first, just log:

- nap start
- nap end
- nighttime blocks

Even a rough log is useful when done consistently.

## Why one-handed logging matters

At 3am, the app must work when you can barely see the screen. The whole goal is to make it quick enough that you actually use it.`,
    bodyVi: `Theo dõi giấc ngủ cho trẻ sơ sinh không phải để tối ưu hoàn hảo.

Nó giúp bạn trả lời hai câu hỏi:

1. Bé đang ngủ theo nhịp nào dễ theo dõi hơn?
2. Có đủ dữ liệu để nói chuyện với bác sĩ nhi nhi không?

## Giữ đơn giản

Ban đầu chỉ cần ghi:

- giờ bắt đầu ngủ
- giờ kết thúc
- các giấc ngủ ban đêm

Ngay cả log sơ sài cũng hữu ích nếu đều đặn.

## Tại sao cần một tay

Lúc 3 giờ sáng, app phải chạy được khi bạn mờ mắt và một tay đang giữ bé. Mục tiêu là ghi nhanh để bạn thực sự sử dụng được nó.`,
  },
  {
    slug: "feeding-schedule-first-months",
    category: "parenting",
    title: "Feeding schedules in the first 3 months",
    excerpt:
      "A realistic look at feeding patterns and why logging them can reduce stress in the first months.",
    date: "2026-02-07",
    readTime: 6,
    author: "henrii team",
    coverImage: FALLBACK_FEEDING_COVER,
    bodyEn: `The first three months can feel relentless.

Feedings often feel all over the place. Tracking helps you notice patterns without turning into a spreadsheet.

## The signal you want

- frequency trend over time
- average duration by day
- nighttime cluster feeds

Once you can see these clearly, you start to sleep a little better because you know what to expect.
`,
    bodyVi: `3 tháng đầu thường rất gian truân.

Việc cho ăn thường diễn ra không theo một quy luật rõ. Việc theo dõi giúp nhận ra xu hướng mà không biến mọi thứ thành bảng tính.

## Những dữ liệu hữu ích

- tần suất theo thời gian
- thời lượng trung bình mỗi ngày
- cụm bú ban đêm

Khi nhìn thấy xu hướng rõ hơn, việc chăm bé đỡ căng thẳng hơn vì bạn có thể dự đoán tốt hơn.`,
  },
];

export function getMarketingBlogPosts(): MarketingBlogPost[] {
  return [...MARKETING_BLOG_POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getMarketingBlogPost(
  locale: string,
  slug: string,
): MarketingBlogPost | undefined {
  return getMarketingBlogPosts().find((post) => post.slug === slug);
}

export function getPostBody(post: MarketingBlogPost, locale: string): string {
  return locale === "vi" ? post.bodyVi : post.bodyEn;
}
