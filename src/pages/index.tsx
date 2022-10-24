import { useMachine } from '@xstate/react'
import {useReducer, useState } from 'react'
import { createMachine } from 'xstate'

const Home = () => {
  return (
    <div>
      <PatternOne />
      <PatternTwo />
      <PatternThree />
    </div>
  )
}

const PatternOne = () => {

  const [toggle, setToggle] = useState(false)

  return (
    <div className=" bg-red-400 p-6">
      <h2 className='pb-1'>
        Most basic example: a simple toggle.
      </h2>
      <h4>
        Uses useState to manage state.
      </h4>
      <button className='rounded-lg px-6 py-3 bg-black text-white ml-6 mt-4' onClick={() => setToggle(prev => !prev)}>
        { toggle ? 'ON' : 'OFF' }
      </button>
      <ul className=" list-disc list-inside ml-6 mt-4">
        <li>
          The most simple example of state management.
        </li>
        <li>
          Uses a single useState, nothing else
        </li>
        <li>
          setToggle is called when button is clicked.
        </li>
      </ul>
    </div>
  )
}

const initialPatternTwoState = {
  toggle: false,
  loading: false,
  count: 0,
  imaginaryData: 0
}

type PatternTwoActionType = {
  type: 'ON' | 'OFF' | 'LOADING'
}


function patternTwoReducer(state: typeof initialPatternTwoState, action: PatternTwoActionType): typeof initialPatternTwoState {

  // if this were real, the expensive calculation would get abstracted out here

  switch (action.type) {
    case 'ON': return {
      count: state.count + 1,
      toggle: true,
      loading: false,
      imaginaryData: Math.random()
    }
    case 'OFF': return {
      toggle: false,
      loading: false,
      imaginaryData: 0,
      count: state.count
    }
    case 'LOADING': return {
      toggle: false,
      loading: true,
      imaginaryData: state.imaginaryData,
      count: state.count
    }
    default: return state
  }
}

const PatternTwo = () => {

  const [state, sendState] = useReducer(patternTwoReducer, initialPatternTwoState)

  const handleClick = () => {
    sendState({ type: 'LOADING' })
    setTimeout(() => {
      sendState({ type: 'ON' })
    }, 1000)
  }

  return (
    <div className=" bg-green-400 p-6">
      <h2 className='pb-1'>
        Slightly more complex: a toggle with some state logic
      </h2>
      <h4>
        Uses a useReducer to manage state.
      </h4>
      <div>
        <button className='rounded-lg px-6 py-3 bg-black text-white ml-6 mt-4' onClick={handleClick}>
          { state.loading ? 'LOADING' : state.toggle ? 'ON' : 'OFF' }
        </button>
        <span className='ml-6'>
          Imaginary expensive calculation that could not be memoized: {state.imaginaryData}
        </span>
      </div>
      <ul className=" list-disc list-inside ml-6 mt-4">
        <li>
          Just barely complex enough to justify using useReducer
        </li>
        <li>
          The expensive calculation is calculated whenever the button is clicked.
        </li>
        <li>
          This expensive calculation is abstracted out in the reducer function, and this simplifies the code. 
        </li>
        <li>
          This is simpler than just using useState alone because by using useReducer, all state logic and declarations are co-located closely together.
        </li>
        <li>
          The jsx still has to "know" of the state logic to some degree, which is fine for small components but scales poorly.
        </li>
      </ul>
    </div>
  )
}

const gameMachine = createMachine({
  id: 'gameSystem',
  initial: 'notLoggedIn',
  states: {
    notLoggedIn: {
      on: {
        LOBBY: 'inLobby'
      }
    },
    inLobby: {
      on: {
        LOG_OUT: 'notLoggedIn',
        ENTER_PRE_GAME: 'inPreGame'
      }
    },
    inPreGame: {
      on: {
        LOG_OUT: 'notLoggedIn',
        LOBBY: 'inLobby',
        START_GAME: 'inGame'
      }
    },
    inGame: {
      on: {
        END_GAME: 'inPostGame',
        // cannot log out or go to lobby while in game
      }
    },
    inPostGame: {
      on: {
        LOG_OUT: 'notLoggedIn',
        LOBBY: 'inLobby',
        // cannot enter a new game unless in the lobby
      }
    },
  }
})

const PatternThree = () => {
  const [systemState, send, service] = useMachine(gameMachine)

  return (
    <div className=" bg-blue-400 p-6">
      <h2 className='pb-1'>
        A state machine to manage system state
      </h2>
      <h4>
        Uses xState
      </h4>
      <div>
        <button className='rounded-lg px-6 py-3 bg-black text-white ml-6 mt-4' onClick={() => send({ type: "LOBBY" })}>
          Go To Lobby (logs in if logged out)
        </button>
        <button className='rounded-lg px-6 py-3 bg-black text-white ml-6 mt-4' onClick={() => send({ type: "ENTER_PRE_GAME" })}>
          Start a new game (by entering a pre-game)
        </button>
        <button className='rounded-lg px-6 py-3 bg-black text-white ml-6 mt-4' onClick={() => send({ type: "START_GAME" })}>
          Pre-game is over, now start the game
        </button>
        <button className='rounded-lg px-6 py-3 bg-black text-white ml-6 mt-4' onClick={() => send({ type: "END_GAME" })}>
          Game is over, now go to post game
        </button>
        <button className='rounded-lg px-6 py-3 bg-black text-white ml-6 mt-4' onClick={() => send({ type: "LOG_OUT" })}>
          Log out
        </button>
        <div className='ml-6 mt-6 text-lg font-bold'>
          <div>
            System status: {`${systemState.value}`}
          </div>
        </div>
      </div>
      <ul className=" list-disc list-inside ml-6 mt-4">
        <li>
          In the example above, a game uses a state machine to manage the system flow consisting of "not logged in", "in lobby", "in game", and "in post game".
        </li>
        <li>
          Displaying an error message to the user when trying to transition to a state that is not allowed is EXTREMELY hard using xstate. After about two hours of troubleshooting, I just gave up trying to do this.
        </li>
        <li>
          State machines only make sense when the status of a system naturally flow from one state to another.
        </li>
        <li>
          State machines do not make sense when either:
          <li>
            The status of a system can be in any number of states at any given time.
          </li>
          <li>
            The system is so simple that the flow of states can very easily be represented using useState or useReducer.
          </li>
        </li>
        <li>
          For scenarios where the user is simply navigating through a ui flow, I cannot find a good use case for a state machine
        </li>
        <li>
          This makes state machines not very useful for most front end applications since most front end applications are just ui flows interlaced with data fetching.
        </li>
        <li>
          For front-end applications where the user is interacting with the UI to move through a series of system states, then a state machine is useful.
        </li>
        <li>
          State machines colocate the state logic and state effects, and this is a nice secondary benefit.
        </li>
      </ul>
    </div>
  )
}



export default Home