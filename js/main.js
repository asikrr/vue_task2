Vue.component('note-card', {
    template: `
        <li class="note" :class="{ noteDone: note.status == 'done' }">
            <h3>{{ note.title }}</h3>
            <ol>
                <li v-for="(item, index) in note.listItems" :key="index">
                    <span :class="{ crossedText: item.done }">{{ item.text }}</span>
                    <input type="checkbox" v-model="item.done" @change="checkStatus" :disabled="item.done || isBlocked">
                </li>
            </ol>
            <p v-if="note.completedDate">
                Дата выполнения: {{ note.completedDate }}
            </p>
        </li>
    `,
    props: {
        note: Object,
        isBlocked: Boolean
    },
    methods: {
        checkStatus() {
            const total = this.note.listItems.length;
            const doneCount = this.note.listItems.filter(item => item.done).length;
            const percent = (doneCount / total) * 100;

            if (percent === 100) {
                this.note.status = 'done';
                this.note.completedDate = new Date().toLocaleString();
            } 
            else if (percent > 50) {
                this.note.status = 'process';
            }
            else {
                this.note.status = 'new';
            }
        }
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
                    :is-blocked="isBlocked"
                ></note-card>
            </ul>
        </div>
    `,
    props: {
        title: String,
        notes: Array,
        isBlocked: Boolean
    }
})

Vue.component('note-form', {
    template: `
        <form @submit.prevent="onSubmit" class="note-form">
            <h2>Добавление заметки</h2>
            <p v-if="disabled" class="dangerText">
                Достигнут лимит заметок в первом столбце
            </p>
            <p>
                <label>Название:</label>
                <input v-model="title" :disabled="disabled" placeholder="Название" required>
            </p>
            <div v-if="listItems.length > 0">
                <ol><li v-for="item in listItems">{{ item.text }}</li></ol>
            </div>
            <p>
                <label>Задачи ({{ listItems.length }}/5):</label>
                <input 
                    v-model="listItem" 
                    :disabled="disabled || listItems.length >= 5" 
                    placeholder="Пункт списка"
                >
                <button 
                    type="button" 
                    @click="addListItem" 
                    :disabled="disabled || listItems.length >= 5"
                >+</button>
            </p>
            <p v-if="listItems.length < 3">
                Минимум 3 пункта
            </p>
            <input 
                type="submit" 
                value="Сохранить" 
                :disabled="disabled || listItems.length < 3"
            >
        </form>
    `,
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
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
            const note = {
                title: this.title,
                listItems: this.listItems,
                status: 'new'
            };
            
            this.$emit('add-note', note);
            this.title = '';
            this.listItem = '';
            this.listItems = [];
        }
    }
});

Vue.component('board', {
    template: `
        <div class="board-container">
            <note-form 
                @add-note="addNote"
                :disabled="isFormBlocked"
            ></note-form>
            <div class="notes">
                <h1>Ваши заметки</h1>
                <div class="column-container">
                    <column title="<=50% выполнения (лимит 3)" :notes="newNotes" :is-blocked="isSecondColumnFull"></column>
                    <column title=">50% выполнения (лимит 5)" :notes="processNotes"></column>
                    <column title="Завершено" :notes="doneNotes"></column>
                </div>        
            </div>
        </div>
    `,
    data() {
        return {
            notes: []
        }
    },
    mounted() {
        if (localStorage.getItem('notes')) {
            this.notes = JSON.parse(localStorage.getItem('notes'));
        }
    },
    watch: {
        notes: {
            handler(newNotes) {
                localStorage.setItem('notes', JSON.stringify(newNotes));
            },
            deep: true
        }
    },
    methods: {
        addNote(note) {
            this.notes.unshift(note);
        }
    },
    computed: {
        newNotes() {
            return this.notes.filter(note => note.status === 'new');
        },
        processNotes() {
            return this.notes.filter(note => note.status === 'process');
        },
        doneNotes() {
            return this.notes.filter(note => note.status === 'done');
        },
        isFormBlocked() {
            return this.newNotes.length >= 3;
        },
        isSecondColumnFull() {
            return this.processNotes.length >= 5;
        }
    }
})

let app = new Vue({
    el: '#app'
})