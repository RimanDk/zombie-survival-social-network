# Backend

## The stack

### Choice of framework

Welcome to the backend portion of this app! The challenge called for writing the backend either in Go or Python and I chose Python. I was starting from scratch with either, so the decision came down to impressions, recommendations and curiosity.

### Package management

The story does not end there, however. Python is just the start. As with any other good language, lib or framework, to reach its full potential, you need packages, modules or plugins to enhance and unlock more capabilities. Python is, apparently, notorious for struggling with this - at least, I was warned about packages being a bit of a mess - and so I was recommended to go with `uv` as my package manager of choice for the most modern, streamlined and painless experience.

### Database

From there, I had a choice to make with regards to storing the data. The challenge calls for a database solution, but leaves open the option of which to pick. I considered `PostgreSQL` but decided to go with `SQLite` as it is built in and, thus, requires the least amount of additional work. As this is supposed to be a quick tech demo, it sounded like an ideal fit. For a more permanent solution with real world usage, I would definitely look for a more robust solution than something that writes a simple file to disk.

### ORM

I learned that, when dealing with databases, it is often a good idea to employ a so-called ORM, or Object Relational Mapper, which translates objects to row data in the database. `SQLAlchemy` was often mentioned as a solid choice for this in the tutorials I have followed, so it became my natural choice.

### Schemas

Schemas are class-based models used for data validation and serialization when dealing with the API. These ensure that data coming into and out of the API meets the defined standard. `Pydantic` was chosen for this for much the same reason as `SQLAlchemy` for ORM - it's what came up in the same breath as other things I was looking for when building this.

### API

Here, I was made aware of several choices involving `Flask`, `Django` and `FastAPI`. `Flask` was described as the simplest and ideal for prototyping. Unsuitable for a production environment and not something that scales well. `Django` seems to sit on the opposite end of the spectrum, like a sort of `Angular` for `Python` APIs. It's the nuclear option with all the bells and whistles, which is widely adopted and can do everything but at the cost of complexity and learning curve. Finally, there is `FastAPI`. This is the newest and most modern of the bunch and by far the fastest, thanks to being built to run asynchronously and handle asynchronous requests. It's not as heavy as `Django` to learn while having a reputation for being a more serious option than `Flask`. I naturally gravitated to this and chose `FastAPI` for building my REST API.

## The data model

As I read through the requirements for the survivor entity, it became clear to me that there was an opportunity to explore all three kinds of data relationships in the same base: many-to-many (inventory of items), one-to-many (infection reports) and one-to-one (location).

I thought this was brilliant, so I decided to pursue this path.
