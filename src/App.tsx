import React from 'react';

import client from './client';

import { Thing } from './types/collections/thing';

import useUser from './hooks/useUser';
import useThings from './hooks/useThings';

import UserContext from './contexts/UserContext';
import ThingsContext from './contexts/ThingsContext';

import SignInButton from './components/SignInButton';
import SignOutButton from './components/SignOutButton';
import UserDetails from './components/UserDetails';

import ThingsTable from './components/ThingsTable';

import { makeRandomThing } from './utils';

import './App.scss'

function App() {

  const [user] = useUser(client);

  const [things, setThings] = useThings(client);

  const myThings = things.filter(thing => thing.owner === user?.id)

  const isSignedIn = React.useCallback(
    () => user !== null,
    [user]
  )

  const createThing = React.useCallback(
    async () => {

      if(!user) {
        console.error('Please authenticate to create checin, or use https://docs.google.com/spreadsheets/d/1Y59WXnzDQqjFwJ0tcp1jlDHVl9R0Wu5_3-knEW4L7k8/edit?usp=sharing! for project checkin data.');
        return
      }

      const newPartialThing = makeRandomThing(user)

      const { data, error } = await client.from(`things`)
        .insert([newPartialThing])
        .select();

      if(!data) {
        console.error(error)
        return
      }

      const newThing = data[0] as Thing

      setThings(things => {
        return [
          ...things,
          newThing
        ]
      })

    },
    [user, things, setThings]
  )

  return (
    <div className="App container py-4 px-3">

      <h1>Eco Ops Checkins</h1>

      <UserContext.Provider value={user}>
        <ThingsContext.Provider value={[things, setThings]}>
          {
            isSignedIn() ?

              // Signed in
              <>
                <section id="whenSignedIn" className='py-4'>

                  <UserDetails />

                  <SignOutButton />

                </section>

                <section id="myThings" className='py-4'>

                  <h2>Biodiversity credit earning activity</h2>

                  {
                    myThings.length ?
                      <ThingsTable things={myThings} user={user!}/> :
                      <p>You have not posted a checkin yet.</p>
                  }

                  <h2>Checkin description</h2>
                  <input type="text" id="checkin" name="checkin" />
                  
                  <button id="createThing" className="btn btn-success"
                    onClick={e => createThing()}>
                    Eco Op Checkin
                  </button>

                </section>

              </> :

              // Signed out
              <section id="whenSignedOut" className='py-4'>

                <SignInButton />

              </section>
          }
        </ThingsContext.Provider>
      </UserContext.Provider>

      <section id="allThings" className='py-4'>

        <h2>All Eco Op Checkins</h2>

        {
          things.length ?
            <ThingsTable things={things} /> :
            <p>Looks like no one has created a Checkin yet! Maybe you could be first!!</p>
        }

      </section>

    </div>
  )

}

export default App
