let eventBus = new Vue()

Vue.component('note-card', {
    template: `
        <li class="note">
            <h3>{{ note.title }}</h3>
            <ol>
                <li v-for="(item, index) in note.listItems" :key="index">
                    <span>{{ item.text }}</span>
                    <input type="checkbox" v-model="item.done">
                </li>
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
            <h1>Ваши заметки</h1>
            <div class="column-container">
                <column title="Новые задачи" :notes="notes"></column>
                <column title="В процессе" :notes="notes"></column>
                <column title="Завершено" :notes="notes"></column>
            </div>        
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

Vue.component('column', {
    template: `
        <div class="column">
            <h2>{{ title }}</h2>
            <ul>
                <note-card 
                    v-for="(note, index) in notes" 
                    :key="index" 
                    :note="note"
                ></note-card>
            </ul>
        </div>
    `,
    props: {
        title: String,
        notes: Array
    }
})

Vue.component('note-form', {
    template: `
        <form @submit.prevent="onSubmit" class="note-form">
        <h2>Добавление заметки</h2>
            <p>
                <label for="title">Название:</label>
                <input id="title" v-model="title" placeholder="Название заметки">
            </p>

            <div v-if="listItems.length > 0">
                <p>Текущий список:</p>
                <ol>
                    <li v-for="item in listItems">{{ item.text }}</li>
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
            title: '',
            listItem: '', 
            listItems: []
        }
    },
    methods: {
        addListItem() {
            if (this.listItem) {
                this.listItems.push({ text: this.listItem, done: false });
                this.listItem = ''; 
            }
        },
        onSubmit() {
            let noteCard = {
                title: this.title,
                listItems: this.listItems
            };

            eventBus.$emit('note-submitted', noteCard);

            this.title = '';
            this.listItem = '';
            this.listItems = [];
        }
    }
});

let app = new Vue({
    el: '#app'
})