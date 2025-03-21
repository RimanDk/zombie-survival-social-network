# Frontend

## The stack

### Choice of main library

Welcome to the frontend portion of the app! The challenge is less rigorous about the choice of tech for the frontend. The only requirement is that it should be a SPA and that it be responsive. So, I went with what I know and chose `React` with `TypeScript` served by `Vite`.

### Styling

In this day and age, there are a multitude of choices for writing CSS. They all have pros and cons. After having navigated the likes of `SCSS`/`LESS`, `Styled Components`, `StyleXJS` and `Tailwind` over many years, I decided to go with `Tailwind` for this project. Simply put, it's the one that affords me the fastest development time and causes least friction at the time of writing.

### UI Library

`React` has existed and been dominant on the market for many years. This kind of success tends to spawn rich ecosystems of third-party support libraries and `React` is no exception. There is a vast market for third-party UI libraries, ranging from the most comprehensive, batteries included, like `MaterialUI` and `Mantine` to more subtle efforts recently, such as `HeadlessUI` and `Radix-UI`, which deliver all the functionality you want without the styling. `Radix-UI` recently added optional theming, which I find pretty appealing. I am familiar with it and thus decided to go with that.

### State management

There are many ways to handle state management in `React`, from prop-drilling local states (`useState`) to leveraging the `Context API` that is native to the library, to third-party solutions like `Redux`, `Zustand` or `AtomJS` (in order of comprehensiveness). I have long been a `Redux` developer and I like it a lot, but its time as the default choice for state management is over. It is simply too cumbersome and mostly unnecessary in this day and age. There are better tools for managing each kind of state for projects of this size. For synchronizing state between frontend and backend, my choice fell on `Tanstack Query`. For in-app state management across components, I went with `Zustand`, which is to `Redux` pretty much what `Vite` is to `Webpack`.

### Routing

I was in doubt whether to use routing in the app or not. There are some clear advantages to doing so, but at the cost of more work and time spent. Moreover, it's the Zombie Apocalypse... who are you going to share links with, anyway? So, while it is absolutely an option, and I could have gone with either `Tanstack Router` or `React-Router`, I decided to try and omit a router and routing altogether and see how that would go.
