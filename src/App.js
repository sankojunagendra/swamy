import React from 'react'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'
//import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions'

class App extends React.Component {
  state = {
    id: "",
    name: "",
    notes: [],
  };
  
  componentDidMount() {
    this.getNotes();
    // this.createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe(
    //   {
    //     next: noteData => {
    //       const newNote = noteData.value.data.onCreateNote;
    //       const prevNotes = this.state.notes.filter(note => note.id !== newNote.id);
    //       const updatedNotes = [...prevNotes, newNote];
    //       this.setState({ notes: updatedNotes});
    //   }
    // });
    // this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe(
    //   {
    //     next: noteData => {
    //       const deletedNote = noteData.value.data.onDeleteNote;
    //       const updatedNotes = this.state.notes.filter(note => note.id !== deletedNote.id);
    //       this.setState({ notes: updatedNotes});
    //     }
    // });
    // this.updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe(
    //   {
    //     next: noteData => {
    //       const { notes } = this.state;
    //       const updatedNote = noteData.value.data.onUpdateNote;
    //       const index = notes.findIndex(note => note.id === updatedNote.id);
    //       const updatedNotes = [
    //         ...notes.slice(0, index),
    //         updatedNote,
    //         ...notes.slice(index + 1)
    //       ]
    //       this.setState({ notes: updatedNotes, name: "", id: ""})
    //     }
    // })
  };
  
  // componentWillUnmount() {
  //   this.createNoteListener.unsubscribe();
  //   this.deleteNoteListener.unsubscribe();
  //   this.updateNoteListener.unsubscribe();
  // };
  getNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes))
    this.setState({ notes: result.data.listNotes.items})
  }
  
  handleChangeNote = event => {
    this.setState({ name: event.target.value})
  };

  hasExistingNote = () => {
    const { notes, id } = this.state
    if(id) {
      // is the id a valid id?
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false;
  };

  handleAddNote = async event => {
      const { name, notes } = this.state;
      event.preventDefault() // this will prevent the default action of submitting a form which is to reload the page
      // check if we have an existing note, if so update it
      if(this.hasExistingNote()) {
          this.handleUpdateNote()
      } else {
          const input = { name }
          const result = await API.graphql(graphqlOperation(createNote, { input }))
          const newNote = result.data.createNote
          const updatedNotes = [newNote, ...notes]
          this.setState({ notes: updatedNotes, name: "" })
      }
  };

  handleDeleteNote = async noteId => {
    const { notes } = this.state;
    const input = { id: noteId }
    const result = await API.graphql(graphqlOperation(deleteNote, { input }))
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id !== deletedNoteId )
    this.setState({ notes: updatedNotes })
  }; 

  handleSetNote = ({ name, id }) => {
    this.setState({ name, id})
  };

  handleUpdateNote = async () => {
    const { notes, id, name } = this.state;
    const input = { id, name }
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1)
    ]
    this.setState({ notes: updatedNotes, name: "", id: ""})
  }

  signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log("error signing out :", error);
    }
  }
  
  render() {
    const { notes, name, id } = this.state;
    return(
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <button onClick={this.signOut} className="pa2 f6 b--dark-blue bw1 ph3 pv2 bg-light-blue">Sign Out</button>
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note form*/}
        <form onSubmit={this.handleAddNote} className="mb3">
          <input
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            onChange={this.handleChangeNote}
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
                  <li onClick={() => this.handleSetNote(item)}
                  className="list pa1 f3">
                    {item.name}
                  </li>
                  <button onClick={() => this.handleDeleteNote(item.id)} className="bg-transparent bn f4">
                    <span>&times;</span>
                  </button>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App);