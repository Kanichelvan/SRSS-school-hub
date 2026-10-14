One-line: glyph-only control for search, menu and the footer social row.

```jsx
<IconButton icon="search" label="Search" />
<IconButton icon="menu" label="Menu" tone="onNavyRing" />
<IconButton icon="instagram" label="Instagram" shape="circle" tone="onNavyRing" size={52} />
```

Circles appear only in the footer "Stay connected" row; everywhere else use `shape="square"`. Keep `size` at 44+.
