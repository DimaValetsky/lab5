import React, { Component }from 'react';
import axios from 'axios';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label} from 'reactstrap';
import './css/style.css';
import gql from 'graphql-tag';
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
    uri: 'http://localhost:8000/graphql/'
});

class App extends Component {
    state = {
        tasks: [],
        newTaskData: {
            name: '',
            status: '',
        },
        newTaskModal: false,
        filterTasksData: '',
        filterTasksModal : false,
        editTaskData: {
            id: '',
            name: '',
            status: '',
        },
        editTaskModal: false,
        detailsTaskData: {
            id: '',
            name: '',
            date: '',
            status: '',
        },
        detailsTaskModal: false,
        loginModal: false,
        loginData: {
            username: '',
            password: '',
        },
        loggedInData: {
            username: '',
            password: '',
            token: '',
        },
        registerModal: false,
        registerData: {
            username: '',
            email: '',
            password: '',
            password2: '',
        },
    };
    componentDidMount() {
        client
              .query({
                query: gql`
                  {
                    tasks {
                    id
                    name
                    date
                    status
                    }
                  }
                `
              })
              .then(result => this.setState({
                        tasks: result.data.tasks,
                    }))
    };
    toggleNewTaskModal() {
        this.setState({
            newTaskModal: ! this.state.newTaskModal
        });
    }
    addTask(){
        client
              .mutate({
                mutation: gql`
                  mutation {
                    createTask(input: {
                        name: "${this.state.newTaskData.name}"
                        status: "${this.state.newTaskData.status}"
                        }) {
                        task {
                            id
                            name
                            date
                            status
                            }}}
                `
              })
              .then(result => {
                  let {tasks} = this.state;
                  tasks.push(result.data.createTask.task);
                  this.setState({
                      tasks,
                      newTaskData: {
                          name: '',
                          status: '',
                      },
                      newTaskModal: !this.state.newTaskModal,
                  })
              })
        this._refreshTasks()
    }
    toggleFilterTasksModal() {
        this.setState({
            filterTasksModal: ! this.state.filterTasksModal
        })
    }
    filterTasks(){
        client
              .query({
                query: gql`
                  {
                    tasks (status:"${this.state.filterTasksData}") {
                    id
                    name
                    date
                    status
                    }
                  }
                `
              })
              .then(result => this.setState({
                        tasks: result.data.tasks,
                        filterTasksModal : false,
                    }))

    }
    toggleEditTaskModal(){
        this.setState({
            editTaskModal: ! this.state.editTaskModal
        });
    }
    editTask(id, name, status){
        this.setState({
            editTaskData:{
                id, name, status
            },
            editTaskModal: ! this.state.editTaskModal,
        });
    }
    updateTask(){
        client
              .mutate({
                mutation: gql`
                  mutation {
                    updateTask(id: ${this.state.editTaskData.id}, input: {
                        name: "${this.state.editTaskData.name}"
                        status: "${this.state.editTaskData.status}"
                        }) {
                        task {
                            id
                            name
                            date
                            status
                            }}}
                `
              })
              .then(result => {
                    this._refreshTasks();
                    this.setState({
                    editTaskData: {
                        id: '',
                        name: '',
                        status: '',
                    },
                    editTaskModal: false,
                  })
              })
    }
    deleteTask(id){
        client
              .mutate({
                mutation: gql`
                mutation {
                    deleteTask(id:${id}){
                        ok
                    }
                  }
                `

              })
              .then(result => {console.log(result)});
        this._refreshTasks()
    }
    toggleDetailsTaskModal(){
        this.setState({
            detailsTaskModal: ! this.state.detailsTaskModal
        });
    }
    detailsTask(id){
        client
              .query({
                query: gql`
                  {
                    task (id:${id}){
                    id
                    name
                    date
                    status
                    }
                  }
                `

              })
              .then(result =>
              this.setState({
                detailsTaskData: result.data.task,
                detailsTaskModal: !this.state.detailsTaskModal,
              }))
    }
    toggleLoginModal(){
        this.setState({
            loginModal: ! this.state.loginModal
        });
    }
    login(){
        const fd = new FormData();
            fd.append('username', this.state.loginData.username);
            fd.append('password', this.state.loginData.password);

            axios.post('http://localhost:8000/login/', fd)
                .then((response) => {
                    this.setState({
                        loggedInData: {
                            username: this.state.loginData.username,
                            password: this.state.loginData.password,
                            token: response.data.access},
                        });
                    })
                .catch(function (error) {
            if (error.response.status === 401) {
                alert('User doesn\'t exist!');
            }
            });
    }
    logout(){
        this.setState(
            { loggedInData: {
                    token: ''
                }});
    }
    toggleRegisterModal(){
        this.setState({
            registerModal: ! this.state.registerModal
        });
    }
    register(){
        if (this.state.registerData.password === this.state.registerData.password2) {

            const fd = new FormData();
            fd.append('username', this.state.registerData.username);
            fd.append('email', this.state.registerData.email);
            fd.append('password', this.state.registerData.password);

            axios.post('http://localhost:8000/register/', fd).then((response) => {
                alert(response.data.detail)
            });

            this.toggleRegisterModal()
        }
        else {
           alert('Passwords don\'t match.')
        }
    }
    _refreshTasks(){
        client
              .query({
                query: gql`
                  {
                    tasks {
                    id
                    name
                    date
                    status
                    }
                  }
                `
              })
              .then(result => {
                  console.log(result)
                  this.setState({
                        tasks: result.data.tasks,
                    })})
    }
    render() {
        let tasks = this.state.tasks.map((task) => {
           return (
               <tr key={task.id}>
                          <td>{task.name}</td>
                          <td>{new Date(task.date).toLocaleString()}</td>
                          <td>{task.status}</td>
                          {/*<td>{task.file != null? <Button color="primary" size="sm" className="mr-2" >
                              {task.file == null? '' : task.file.replace(/^.*[\\\/]/, '')}</Button> : ''}
                          </td>*/}
                          <td>
                              <Button color="info" size="sm" className="mr-2"
                                      onClick={this.detailsTask.bind(this, task.id)}>
                                  Details</Button>
                              <Button color="success" size="sm" className="mr-2"
                                      onClick={this.editTask.bind(this, task.id, task.name, task.status)}>
                                  Edit</Button>
                              <Button color="danger" size="sm"
                                      onClick={this.deleteTask.bind(this, task.id)}>
                                  Delete</Button>
                          </td>
                    </tr>
           )
        });
        return (
            <div className="App_container">
                <nav>
                    <h3 className="logo">Tasks</h3>
                    {/*<h4 className="logo">Hello, &nbsp;
                        {this.state.loggedInData.token === '' ? 'guest!' : this.state.loggedInData.username + '!'}
                    </h4>*/}
                    <ul className="nav-menu">
                        <li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this._refreshTasks.bind(this)}>Task List</Button></li>
                        <li>
                            <Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.toggleNewTaskModal.bind(this)}>Add Task</Button>
                            <Modal isOpen={this.state.newTaskModal} toggle={this.toggleNewTaskModal.bind(this)}>
                                <ModalHeader toggle={this.toggleNewTaskModal.bind(this)}>Add a new task</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="task_name">Task Name</Label>
                                        <Input type="text" id="task_name" placeholder="Name"
                                               value={this.state.newTaskData.name}
                                               onChange={(e) => {
                                                   let { newTaskData } = this.state;
                                                   newTaskData.name = e.target.value;
                                                   this.setState({ newTaskData })
                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="task_status">Task Status</Label>
                                        <Input type="text" id="task_status" placeholder="Status"
                                               value={this.state.newTaskData.status}
                                               onChange={(e) => {
                                                   let { newTaskData } = this.state;
                                                   newTaskData.status = e.target.value;
                                                   this.setState({ newTaskData })
                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.addTask.bind(this)}>Add Task</Button>{' '}
                                    <Button color="secondary"
                                            onClick={this.toggleNewTaskModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        </li>
                        <li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.toggleFilterTasksModal.bind(this)}>Filter</Button></li>
                            <Modal isOpen={this.state.filterTasksModal} toggle={this.toggleFilterTasksModal.bind(this)}>
                                <ModalHeader toggle={this.toggleFilterTasksModal.bind(this)}>Filter tasks</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="filter">Filter by status</Label>
                                        <Input type="text" id="filter" placeholder="Filter by status"
                                               value={this.state.filterTasksData} onChange={(e) => {
                                                   let { filterTasksData } = this.state;
                                                   filterTasksData = e.target.value;

                                                   this.setState({ filterTasksData })
                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.filterTasks.bind(this)}>Filter</Button>{' '}
                                    <Button color="secondary"
                                            onClick={this.toggleFilterTasksModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        {/*<li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.toggleRegisterModal.bind(this)}>Register</Button></li>
                            <Modal isOpen={this.state.registerModal} toggle={this.toggleRegisterModal.bind(this)}>
                                <ModalHeader toggle={this.toggleRegisterModal.bind(this)}>Register</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="username">Username</Label>
                                        <Input type="text" id="username" placeholder="Username"
                                               value={this.state.registerData.username} onChange={(e) => {
                                                   let { registerData } = this.state;
                                                   registerData.username = e.target.value;

                                                   this.setState({ registerData })

                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="email">Email</Label>
                                        <Input type="text" id="email" placeholder="Email"
                                               value={this.state.registerData.email} onChange={(e) => {
                                                   let { registerData } = this.state;
                                                   registerData.email = e.target.value;

                                                   this.setState({ registerData })

                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Password</Label>
                                        <Input type="text" id="password" placeholder="Password"
                                               value={this.state.registerData.password} onChange={(e) => {
                                            let {registerData} = this.state;
                                            registerData.password = e.target.value;

                                            this.setState({registerData})
                                        }}/>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="password">Repeat password</Label>
                                        <Input type="text" id="password2" placeholder="Repeat password"
                                               value={this.state.registerData.password2} onChange={(e) => {
                                                   let { registerData } = this.state;
                                                   registerData.password2 = e.target.value;

                                                   this.setState({ registerData })

                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.register.bind(this)}>Register</Button>{' '}
                                    <Button color="secondary"
                                            onClick={this.toggleRegisterModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>*/}
                        {/*<li><Button color="info" size="lg" className="mr-2 mt-md-2"
                                    onClick={this.state.loggedInData.token === '' ?
                                        this.toggleLoginModal.bind(this) :
                                        this.logout.bind(this)}>
                                        {this.state.loggedInData.token === '' ?
                                        'Login' : 'Logout'}</Button></li>
                            <Modal isOpen={this.state.loginModal} toggle={this.toggleLoginModal.bind(this)}>
                                <ModalHeader toggle={this.toggleLoginModal.bind(this)}>Login</ModalHeader>
                                <ModalBody>
                                    <FormGroup>
                                        <Label for="username">Username</Label>
                                        <Input type="text" id="username" placeholder="Username"
                                               value={this.state.loginData.username} onChange={(e) => {
                                                   let { loginData } = this.state;
                                                   loginData.username = e.target.value;

                                                   this.setState({ loginData })

                                        }}/>
                                        <Label for="password">Password</Label>
                                        <Input type="text" id="password" placeholder="Password"
                                               value={this.state.loginData.password} onChange={(e) => {
                                            let {loginData} = this.state;
                                            loginData.password = e.target.value;

                                            this.setState({loginData})
                                        }}/>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary"
                                            onClick={this.login.bind(this)}>Login</Button>
                                    <Button color="secondary"
                                            onClick={this.toggleLoginModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>*/}
                    </ul>
                </nav>
                <Modal isOpen={this.state.detailsTaskModal} toggle={this.toggleDetailsTaskModal.bind(this)}>
                    <ModalHeader toggle={this.toggleDetailsTaskModal.bind(this)}>Task details</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="task_id">Task ID:</Label>
                            <Input type="text" readOnly={true} id="task_id"
                                   placeholder={this.state.detailsTaskData.id}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_name">Task Name:</Label>
                            <Input type="text" readOnly={true} id="task_name"
                                   placeholder={this.state.detailsTaskData.name}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_status">Task Status:</Label>
                            <Input type="text" readOnly={true} id="task_status"
                                   placeholder={this.state.detailsTaskData.status}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_date">Task Date:</Label>
                            <Input type="text" readOnly={true} id="task_date"
                                   placeholder={new Date(this.state.detailsTaskData.date).toLocaleString()}/>
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                                onClick={this.toggleDetailsTaskModal.bind(this)}>Ok</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.editTaskModal} toggle={this.toggleEditTaskModal.bind(this)}>
                    <ModalHeader toggle={this.toggleEditTaskModal.bind(this)}>Edit task</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label for="task_name">Task Name</Label>
                            <Input type="text" id="task_name" placeholder="Name"
                                   value={this.state.editTaskData.name}
                                   onChange={(e) => {
                                       let { editTaskData } = this.state;
                                       editTaskData.name = e.target.value;
                                       this.setState({ editTaskData })
                                   }}/>
                        </FormGroup>
                        <FormGroup>
                            <Label for="task_status">Task Status</Label>
                            <Input type="text" id="task_status" placeholder="Status"
                                   value={this.state.editTaskData.status}
                                   onChange={(e) => {
                                       let { editTaskData } = this.state;
                                       editTaskData.status = e.target.value;
                                       this.setState({ editTaskData })
                                   }}/>
                        </FormGroup>
                        {/*<FormGroup>
                            <Label for="task_file">Task File</Label>
                            <Input type="file" id="task_file" placeholder="Attach File"
                                   //value={this.state.editTaskData.file}
                                   onChange={(e) => {
                                       let { editTaskData } = this.state;
                                       editTaskData.file = e.target.files[0];
                                       this.setState({ editTaskData })
                                   }}/>
                        </FormGroup>*/}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                                onClick={this.updateTask.bind(this)}>Update Task</Button>
                        <Button color="secondary"
                                onClick={this.toggleEditTaskModal.bind(this)}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Table>
                    <thead>
                    <tr>
                          <th>Task Name</th>
                          <th>Task Date</th>
                          <th>Task Status</th>
                      </tr>
                    </thead>

                    <tbody>
                        {tasks}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default App;
