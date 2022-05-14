const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

/**
         * Các chức năng cần thực hiện:
         * 1. Render songs
         * 2. Scroll top 
         * 3. Play / pause / seek  
         * 4. CD rotate 
         * 5. Next / prev - > ok
         * 6. Random  
         * 7. Next / Repeat when ended 
         * 8. Active song 
         * 9. Scroll active song info view 
         * 10. Play song when click 
 */

const playlist = $('.playlist')
const cd = $('.cd')

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')

const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')

const controlBtn = $('.control')

const randomBtn = $('.btn-random')

const reqeatBtn = $('.btn-repeat')

const PLAYER_STORE_KEY = 'F8_PLAYER'

const app = {
    currentIndex: 0, // lấy index đầu tiên của mảng
    isPlaying: false, // Bắt sự kiện tạo nút dừng / tắt music
    isRandom: false, // Bắt sự kiện tạo có màu và mất màu
    isRepeat: false, // Bắt sự kiện kết thúc bài hát và lặp lại
    config: JSON.parse(localStorage.getItem(PLAYER_STORE_KEY)) || {},
    songs: [
        {
            name: 'Hãy trao cho anh',
            singer: 'Sơn Tùng MT-P',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg',
        },
        {
            name: 'Chúng ta không thuộc về nhau',
            singer: 'Sơn Tùng MT-P',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg',
        },
        {
            name: 'Phía sau em',
            singer: 'Kay Trần, Binz',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg',
        },
        {
            name: 'Cưới thôi',
            singer: 'B Ray',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.png',
        },
        {
            name: 'Gu',
            singer: 'Cukak',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg',
        },
        {
            name: 'Thôi anh không chơi đâu',
            singer: 'Binz',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg',
        },
        {
            name: 'Still life',
            singer: 'BigBang',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg',
        },
        {
            name: 'Thức giấc',
            singer: 'Da Lab',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpg',
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORE_KEY, JSON.stringify(this.config));
    },

    // 1. Render songs
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                        <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },


    handleEvents: function () {
        const _this = this

        // Bắt xự kiện cursor click hiện bàn tay
        controlBtn.onclick = function() {
            playBtn.style.cursor = 'pointer'
            nextBtn.style.cursor = 'pointer'
            prevBtn.style.cursor = 'pointer'
            randomBtn.style.cursor = 'pointer'
            reqeatBtn.style.cursor = 'pointer'
        }
        
        // 2. Scroll top : Xử lý phóng to và thu nhỏ CD
        const cdWidth = cd.offsetWidth;
        document.onscroll = function () {
            const scrollTop = cd.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth - scrollTop

            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth

        }

        // 3. Play / pause / seek
        // Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
            // playBtn.style.cursor = 'pointer'
        }

        // Khi song được play 
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add("playing")
            cdThumbAnimate.play()
            
        }

        // Khi song được pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove("playing")
            cdThumbAnimate.pause()
        }

        // khi tiến dài độ dài bài hát thay đổi seek
        audio.ontimeupdate = function () {
            if (audio.duration) { // tổng số dây bài hát
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) 
                progress.value = progressPercent
            }
        }

        // Xử lý khi chúng ta muốn tua song 
        progress.onchange = function(e) {
            // console.log(e.target.value) // lấy ra từng phần trăm cụ thể
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }
        

        // 4. CD rotate 
        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' },
        ], {
             duration: 10000,
             iterations: Infinity,
        })
        cdThumbAnimate.pause()


        // 5. Next / prev
        // Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play() // lặp lại bài hát
            _this.render() // 8. active song
            _this.scrollToActiveSong() // 9. Xử lý cuộc play list khi next

        }

        // Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()   
            _this.render() // 8. active song
            _this.scrollToActiveSong() // 9. Xử lý cuộc play list khi prev 
        } 


        // 6. Random : Xử lý bật / tắt ramdom song
        randomBtn.onclick = function() {
            _this.isRandom =! _this.isRandom
            randomBtn.classList.toggle('active', _this.isRandom) // có thì gỡ active và ko có thì thêm active
            _this.playRandomSong()
            _this.render()
            audio.play()
            _this.scrollToActiveSong()
        }


        // 7. Next / Repeat when ended : 
        // Xử lý phát lại 1 song
        reqeatBtn.onclick = function() {
            _this.isRepeat = ! _this.isRepeat
            reqeatBtn.classList.toggle('active', _this.isRepeat)
        }
        
        // Xử lý next song khi audio ended : qua bài khác sau khi đã kết thúc
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play() // play lại bài hát
            } else {
                nextBtn.click() // qua bài khác 
            }
        }


        // 8. active song ${index === this.currentIndex ? 'active' : ''}

        // 9. Scroll active song info view : xử lý cuộc play list

        // 10. Lắng nghe hành vi click vào play list 
        // data-index="${index}" : Thêm vào render
        playlist.onclick = function(e) {
            // console.log(e.target) // kiểm tra có click vào đc ko, target để định vị trí chổ nào
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {

                // Xử lý click vào song 
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSongs()
                    _this.render()
                    audio.play()
                }
                // Xử lý khi click vào song option
                if (e.target.closest('.option')) {}
            }
            playlist.style.cursor = 'pointer'

        }



 
    },


    defaultPropertys: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    loadCurrentSongs: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

    },

    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        } 
        this.loadCurrentSongs()
    },

    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSongs()

    },


    playRandomSong : function() {
        let nextIndex 
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (nextIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSongs()
    },

    scrollToActiveSong : function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 200)
    },


    loadConfig : function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },


    start: function () {
        // Gán cầu hình từ config vào ứng dụng
        this.loadConfig()

        // Định nghĩa các thuộc tính cho Object
        this.defaultPropertys()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSongs()

        // lắng nghe và xử lý các sự kiện (DOM EVENTS)
        this.handleEvents()

        // Render play lists
        this.render();


        // hiển thị trạng thái ban đầu của button reqeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        reqeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();