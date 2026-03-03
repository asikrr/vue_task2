let eventBus = new Vue()

Vue.component('note-card', {
    template: `
        <li class="note">
            <h3>{{ note.title }}</h3>
            <ol>
                <li v-for="item in note.listItems">{{ item }}</li>
            </ol>
        </li>
    `,
    props: {
        note: Object
    }
})

Vue.component('board', {
    template: `
        <div class="board-container">
            <h1>Заметки</h1>
            <ul>
                <note-card 
                    v-for="(note, index) in notes" 
                    :key="index" 
                    :note="note"
                ></note-card>
            </ul>
        </div>
    `,
    data() {
        return {
            notes: []
        }
    },
    mounted() {
        eventBus.$on('note-submitted', noteCard => {
            this.notes.push(noteCard)
        })
    }
})

Vue.component('note-form', {
    template: `
        <form @submit.prevent="onSubmit" class="note-form">
            <p>
                <label for="title">Название:</label>
                <input id="title" v-model="title" placeholder="Название заметки">
            </p>

            <div v-if="listItems.length > 0">
                <p>Текущий список:</p>
                <ol>
                    <li v-for="item in listItems">{{ item }}</li>
                </ol>
            </div>

            <p>
                <label for="list-item">Список:</label>
                <input id="list-item" v-model="listItem" placeholder="Пункт списка" @keyup.enter="addListItem">
                <button type="button" @click="addListItem">Добавить пункт</button>
            </p>

            <p>
                <input type="submit" value="Сохранить заметку">
            </p>
        </form>
    `,
    data() {
        return {
            title: null,
            listItem: null,
            listItems: [],
        }
    },
    methods: {
        addListItem() {
            if (this.listItem) {
                this.listItems.push(this.listItem);
                this.listItem = null;
            }
        },
        onSubmit() {
            let noteCard = {
                title: this.title,
                listItems: this.listItems
            };

            eventBus.$emit('note-submitted', noteCard);

            this.title = null;
            this.listItem = null;
            this.listItems = [];
        }
    }
});

let app = new Vue({
    el: '#app'
})