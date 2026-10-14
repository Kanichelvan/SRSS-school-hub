One-line: a column in the three-up pillar row ("Academic confidence / Human values in action / Compassionate leadership").

```jsx
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
  <PillarCard divider={false} title="Academic confidence" body="Rigorous, engaging learning that builds knowledge and curiosity." />
  <PillarCard title="Human values in action" body="Daily practice of respect, honesty and responsibility." />
  <PillarCard title="Compassionate leadership" body="Empathy, service and teamwork that inspire every child." />
</div>
```

SRSS pillars are separated by hairlines, never boxed into shadowed cards. Set `divider={false}` on the first column.
