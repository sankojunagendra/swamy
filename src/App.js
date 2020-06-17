import React from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries'

class App extends React.Component {
  state = {
    id: "",
    name: "",
    notes: []
  };

  async componentDidMount() {
    const result = await API.graphql(graphqlOperation(listNotes))
    this.setState({ notes: result.data.listNotes.items})
  };

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
   
  render() {
    const { notes, name, id } = this.state;
    return(
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
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