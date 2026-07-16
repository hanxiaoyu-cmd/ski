# 雪场图片目录

- 封面图放这里：`<slug>.jpg`（如 `wanlong.jpg`），然后把 `data/seeds/resorts.json` 中该雪场的
  `coverImageUrl` 设为 `/images/resorts/<slug>.jpg` 并重新 `pnpm db:seed`。
- 雪道图放 `../trail-maps/<slug>.jpg`，对应字段 `trailMapUrl`。
- 请使用有授权的图片（自摄、雪场官方授权或 CC0 图库），注意版权。
