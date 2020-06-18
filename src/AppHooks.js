import React, { useState, useEffect } from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'

const App = () => {
    const [ id, setId ] = useState("")
    const [ name, setName ] = useState("")
    const [ notes, setNotes ] = useState([])

    useEffect(() => {
        getNotes();
    //     const createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe(
    //       {
    //         next: noteData => {
    //             const newNote = noteData.value.data.onCreateNote;
    //             setNotes( prevNotes => {
    //                 const oldNotes = prevNotes.filter(note => note.id !== newNote.id)
    //                 const updatedNotes = [ ...oldNotes, newNote ]
    //                 return updatedNotes
    //             })
    //       }
    //     });
    //     const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe(
    //       {
    //         next: noteData => {
    //             const deletedNote = noteData.value.data.onDeleteNote;
    //             setNotes( prevNotes => {
    //                 const updatedNotes = prevNotes.filter(note => note.id !== deletedNote.id)
    //                 return updatedNotes
    //             })
    //         }
    //     });
    //     const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe(
    //       {
    //         next: noteData => {
    //            const updatedNote = noteData.value.data.onUpdateNote;
    //             setNotes( prevNotes => {
    //                 const index = prevNotes.findIndex(note => note.id === updatedNote.id);
    //                 const updatedNotes = [
    //                     ...prevNotes.slice(0, index),
    //                     updatedNote,
    //                     ...prevNotes.slice(index + 1)
    //                   ];
    //                   return updatedNotes;
    //             })
    //             setName ( "" )
    //             setId ( "" )
    //         }
    //     });
    //    return () => {
    //     createNoteListener.unsubscribe();
    //     deleteNoteListener.unsubscribe();
    //     updateNoteListener.unsubscribe();
    //    } 
    }, [])
    
  const getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    setNotes( result.data.listNotes.items );
  }
  
  const handleChangeNote = event => {
    setName( event.target.value );
  };

  const hasExistingNote = () => {
    if(id) {
      // is the id a valid id?
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false;
  };

  const handleAddNote = async event => {
      event.preventDefault() // this will prevent the default action of submitting a form which is to reload the page
      // check if we have an existing note, if so update it
      if(hasExistingNote()) {
          handleUpdateNote()
      } else {
          const input = { name }
          const result = await API.graphql(graphqlOperation(createNote, { input }))
          const newNote = result.data.createNote
          setNotes( prevNotes => {
            const oldNotes = prevNotes.filter(note => note.id !== newNote.id)
            const updatedNotes = [ ...oldNotes, newNote ]
            return updatedNotes
        })
        setName( "" );
      }
  };

  const handleDeleteNote = async noteId => {
    const input = { id: noteId }
    const result = await API.graphql(graphqlOperation(deleteNote, { input }))
    const deletedNote = result.data.deleteNote.id;
    setNotes( prevNotes => {
        const updatedNotes = prevNotes.filter(note => note.id !== deletedNote)
        return updatedNotes
    })
  };
  
  const handleSetNote = ({ name, id }) => {
    setName( name )
    setId( id )
  };

  const handleUpdateNote = async () => {
    const input = { id, name }
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    setNotes( prevNotes => {
        const index = prevNotes.findIndex(note => note.id === updatedNote.id);
        const updatedNotes = [
            ...prevNotes.slice(0, index),
            updatedNote,
            ...prevNotes.slice(index + 1)
        ];
        return updatedNotes;
    })
    setName ( "" )
    setId ( "" )
  }

  const signOut = async () => {
        try {
        await Auth.signOut();
        } catch (error) {
        console.log("error signing out :", error);
        }
  }
    return(
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <button onClick={signOut} className="pa2 f6 b--dark-blue bw1 ph3 pv2 bg-light-blue">Sign Out</button>
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note form*/}
        <form onSubmit={handleAddNote} className="mb3">
          <input
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            onChange={handleChangeNote}
            value={name} />
          <button className="pa2 f4" type="submit">
              { id ? "Update Note" : "Add Note"}
          </button>
        </form>
        {/*Notes List */}
        <div>
            {notes.map(item => (
              <div key={item.id}
                   className="flex items-center">
                  <li onClick={() => handleSetNote(item)}
                  className="list pa1 f3">
                    {item.name}
                  </li>
                  <button onClick={() => handleDeleteNote(item.id)} className="bg-transparent bn f4">
                    <span>&times;</span>
                  </button>
              </div>
            ))}
        </div>
      </div>
    );
}

export default withAuthenticator(App);