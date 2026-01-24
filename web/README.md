# ShortBreak Web UI

This is the web UI for the ShortBreak project. This UI allows user to prompt the app to generate youtube shorts in order to learn. Here is the flow:

1. The User enters a prompt about a topic they want to learn. They can optionally attach a file containing the content they want to learn.
2. The app hits Gemini API to intelligently prepare an learning outline for the prompted topic.
3. For each subtopic in the outline, the app searches for relevant YouTube shorts and displays to the user.
4. The user scrolls through the lift of YouTube shorts with the familiar youtube shorts UI or Instagram reels.
5. When the end of the list is reached, the next subtopic is searched and displayed. Optionally, the subtopics can be randomized.

## Stack

- Nextjs
- TailwindCss
- Convex Db
- Gemini Api

## Requirements

- The app must use ShadCn components.
- The app must use Convex Db for its reactive data sync.
- The app must use the tailwind variables defined in the ./src/app/globals.css file.
- The UI must look like a typical chatbot interface.
- After the user enters a prompt, the UI should display a list of relevant YouTube shorts in an infinite scrolling pattern.
- The UI should allow the user to scroll through the list of YouTube shorts.
- The YouTube shorts must be autoplayed when the user scrolls to them.
- The webapp must be mobile first.
- The left sidebar contains the history of prompts the user had entered. Each prompt contains their metadata such as which video the user has scrolled to.
- Selecting a prompt from the history makes the UI display the short the User last scrolled to.
- A prompt in the history sidebar should be deletable.

