# 🎯 Wordle Clone

> **Guess the word. Master the game. Become a word wizard! 🧙‍♂️✨**

A stunning, fully-featured recreation of the beloved Wordle game that took the world by storm! Challenge yourself with 5-letter word puzzles in this sleek, dark-themed experience that captures all the addictive fun of the original.

![Wordle Clone Screenshot](https://github.com/user-attachments/assets/cced29b7-fecb-4da2-9cb7-fc2f203274e8)

## 🌟 Features That Shine

✨ **Perfect Wordle Recreation** - All the mechanics you know and love  
🎨 **Beautiful Dark Theme** - Easy on the eyes, stunning to play  
⌨️ **Dual Input Methods** - Use your keyboard or the on-screen keys  
💾 **Smart State Persistence** - Your progress is automatically saved  
🎲 **Endless Gameplay** - Generate new puzzles anytime with "New Game"  
📱 **Responsive Design** - Looks amazing on any screen size  
🎯 **Precise Word Validation** - Only real words accepted!  

## 🎮 How to Play

1. **Guess the 5-letter word** in 6 tries or less
2. **Type your guess** using keyboard or on-screen buttons
3. **Press ENTER** to submit your guess
4. **Watch the magic** as letters change colors:
   - 🟩 **Green** - Right letter in the right spot!
   - 🟨 **Yellow** - Right letter, wrong position
   - ⬜ **Gray** - Letter not in the word
5. **Use the clues** to solve the puzzle
6. **Celebrate** when you crack the code! 🎉

## 🛠️ Built With Modern Tech

- **⚡ Next.js 15** - Lightning-fast React framework with Turbopack
- **📘 TypeScript** - Type-safe development for reliability  
- **🎨 Tailwind CSS v4** - Beautiful, utility-first styling
- **🎯 React 19** - Latest React features for smooth gameplay
- **💡 Smart Architecture** - Clean, maintainable code structure

## 🚀 Quick Start

Get your word game running in seconds:

```bash
# Clone this awesome project
git clone <your-repo-url>
cd wordle-clone-ai

# Install the magic
npm install

# Launch your local word playground
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start guessing! 🎯

## 🔨 Available Commands

```bash
npm run dev    # 🚀 Start development server (with Turbopack!)
npm run build  # 📦 Create production build
npm start      # 🌐 Run production server
npm run lint   # 🔍 Check code quality
```

## 🎨 Game Architecture

The game features a clean, modular structure:

- **`src/app/page.tsx`** - Main game logic and state management
- **`src/components/Board.tsx`** - The beautiful letter grid
- **`src/components/Keyboard.tsx`** - Interactive on-screen keyboard  
- **`src/components/Header.tsx`** - Game title and controls
- **`src/lib/wordle.ts`** - Core game mechanics and word validation
- **`src/lib/utils.ts`** - Handy utility functions

## 🎯 Core Game Logic

- **Daily Words** - Rotating selection of carefully curated 5-letter words
- **Duplicate Letter Handling** - Just like the real Wordle!
- **Smart Keyboard Updates** - Keys show their status as you play
- **Persistent State** - Resume games exactly where you left off
- **Input Validation** - Only valid English words accepted

## 🚀 Deploy Your Own

### Vercel (Recommended)

The fastest way to share your word game with the world:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/wordle-clone-ai)

### Manual Deployment

```bash
npm run build    # Build for production
npm start        # Serve the built app
```

## 🤝 Contributing

Found a bug? Have an idea? Contributions make the word game community stronger! 

1. Fork the project
2. Create your feature branch
3. Commit your changes  
4. Push to the branch
5. Open a Pull Request

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the original Wordle by Josh Wardle
- Built with love for word game enthusiasts everywhere
- Powered by the amazing Next.js and React ecosystems

---

**Ready to test your word skills? [Play now!](http://localhost:3000) 🎮**

*Happy word hunting! May your guesses be ever in your favor! 🍀*
