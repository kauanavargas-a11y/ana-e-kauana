document.addEventListener('DOMContentLoaded',()=>{
	// Carrossel de imagens
	const setupCarousel = () => {
		const imgs = document.querySelectorAll('.carousel-img')
		const dots = document.querySelectorAll('.dot')
		const prevBtn = document.querySelector('.carousel-prev')
		const nextBtn = document.querySelector('.carousel-next')
		let currentIdx = 0
		
		const showImg = (idx) => {
			imgs.forEach(img => img.classList.remove('active'))
			dots.forEach(dot => dot.classList.remove('active'))
			imgs[idx].classList.add('active')
			dots[idx].classList.add('active')
			currentIdx = idx
		}
		
		const nextImg = () => {
			showImg((currentIdx + 1) % imgs.length)
		}
		
		const prevImg = () => {
			showImg((currentIdx - 1 + imgs.length) % imgs.length)
		}
		
		prevBtn?.addEventListener('click', prevImg)
		nextBtn?.addEventListener('click', nextImg)
		
		dots.forEach(dot => {
			dot.addEventListener('click', () => {
				showImg(parseInt(dot.getAttribute('data-index')))
			})
		})
		
		// Auto-rotação a cada 5 segundos
		setInterval(nextImg, 5000)
	}
	setupCarousel()

	// Contador de visitas (localStorage)
	try{
		const key='kauana_blog_visits_v1'
		let visits = parseInt(localStorage.getItem(key)||'0',10)
		visits = isNaN(visits)?1:visits+1
		localStorage.setItem(key,String(visits))
		const el = document.getElementById('visit-count')
		if(el) el.textContent = `Visitas: ${visits}`
	}catch(e){console.warn('localStorage indisponível',e)}

	// Sistema de comentários
	const setupComments = () => {
		const posts = document.querySelectorAll('.post')
		posts.forEach((post, postIdx) => {
			const form = post.querySelector('.comment-form')
			const input = post.querySelector('.comment-input')
			const commentsList = post.querySelector('.comments-list')
			
			const storageKey = `comments_post_${postIdx}`
			const savedComments = JSON.parse(localStorage.getItem(storageKey) || '[]')
			
			// Carrega comentários salvos
			savedComments.forEach(comment => {
				addCommentToDOM(commentsList, comment.author, comment.text)
			})
			
			form?.addEventListener('submit', (e) => {
				e.preventDefault()
				const text = input.value.trim()
				if(!text) return
				
				const comment = {
					author: 'Visitante',
					text: text,
					date: new Date().toLocaleDateString('pt-BR')
				}
				
				savedComments.push(comment)
				localStorage.setItem(storageKey, JSON.stringify(savedComments))
				addCommentToDOM(commentsList, comment.author, comment.text)
				input.value = ''
			})
		})
	}
	
	const addCommentToDOM = (container, author, text) => {
		const div = document.createElement('div')
		div.className = 'comment-item'
		div.innerHTML = `<div class="comment-author">${author}</div><p class="comment-text">${text}</p>`
		container.appendChild(div)
		container.scrollTop = container.scrollHeight
	}
	
	setupComments()

	// Atualiza data no rodapé
	const buildDate = document.getElementById('build-date')
	if(buildDate){
		const now = new Date()
		buildDate.textContent = `Data: ${now.toLocaleDateString('pt-BR')}`
	}

	// Busca nos posts
	const input = document.getElementById('search')
	const posts = Array.from(document.querySelectorAll('.post'))
	if(input){
		input.addEventListener('input',()=>{
			const q = input.value.trim().toLowerCase()
			posts.forEach(post=>{
				const title = (post.getAttribute('data-title')||'').toLowerCase()
				const content = (post.getAttribute('data-content')||'').toLowerCase()
				const text = (post.textContent||'').toLowerCase()
				const match = q === '' || title.includes(q) || content.includes(q) || text.includes(q)
				post.style.display = match? 'flex' : 'none'
			})
		})
	}

	// Toggle nav for mobile
	const navToggle = document.getElementById('nav-toggle')
	const navList = document.getElementById('nav-list')
	if(navToggle && navList){
		navToggle.addEventListener('click',()=>{
			const shown = navList.classList.toggle('show')
			navToggle.setAttribute('aria-expanded', String(shown))
		})
	}

	// Sistema de Like/Dislike nos posts
	const setupReactions = () => {
		const posts = document.querySelectorAll('.post')
		posts.forEach((post, idx) => {
			const likeBtn = post.querySelector('.btn-like')
			const dislikeBtn = post.querySelector('.btn-dislike')
			const likeCount = post.querySelector('.like-count')
			const dislikeCount = post.querySelector('.dislike-count')
			
			const storageKey = `post_${idx}`
			const saved = JSON.parse(localStorage.getItem(storageKey) || '{"likes":0,"dislikes":0,"userLiked":false,"userDisliked":false}')
			
			// Carrega contadores salvos
			likeCount.textContent = saved.likes
			dislikeCount.textContent = saved.dislikes
			if(saved.userLiked) likeBtn.classList.add('active')
			if(saved.userDisliked) dislikeBtn.classList.add('active')
			
			likeBtn.addEventListener('click', () => {
				if(saved.userLiked){
					saved.likes--
					saved.userLiked = false
					likeBtn.classList.remove('active')
				}else{
					if(saved.userDisliked){
						saved.dislikes--
						saved.userDisliked = false
						dislikeBtn.classList.remove('active')
					}
					saved.likes++
					saved.userLiked = true
					likeBtn.classList.add('active')
				}
				likeCount.textContent = saved.likes
				dislikeCount.textContent = saved.dislikes
				localStorage.setItem(storageKey, JSON.stringify(saved))
			})
			
			dislikeBtn.addEventListener('click', () => {
				if(saved.userDisliked){
					saved.dislikes--
					saved.userDisliked = false
					dislikeBtn.classList.remove('active')
				}else{
					if(saved.userLiked){
						saved.likes--
						saved.userLiked = false
						likeBtn.classList.remove('active')
					}
					saved.dislikes++
					saved.userDisliked = true
					dislikeBtn.classList.add('active')
				}
				likeCount.textContent = saved.likes
				dislikeCount.textContent = saved.dislikes
				localStorage.setItem(storageKey, JSON.stringify(saved))
			})
		})
	}
	setupReactions()

	const modal = document.getElementById('articleModal')
	const closeModal = document.getElementById('closeModal')
	const modalBody = document.getElementById('modalBody')
	
	// Fechar modal ao clicar no botão X
	if(closeModal){
		closeModal.addEventListener('click',()=>{
			modal.classList.add('hidden')
		})
	}
	
	// Fechar modal ao clicar fora
	if(modal){
		modal.addEventListener('click',(e)=>{
			if(e.target === modal){
				modal.classList.add('hidden')
			}
		})
	}
	
	// Abrir modal ao clicar em "Leia mais"
	const readMoreLinks = document.querySelectorAll('.read-more')
	readMoreLinks.forEach(link=>{
		link.addEventListener('click',(e)=>{
			e.preventDefault()
			const article = link.closest('.post')
			if(article){
				const title = article.getAttribute('data-title')||'Artigo'
				const fullContent = article.getAttribute('data-full')||'Conteúdo não disponível'
				
				// Formata o conteúdo em parágrafos
				const paragraphs = fullContent.split('\n\n').map(p=>p.trim()).filter(p=>p)
				const htmlContent = paragraphs.map(p=>`<p>${p}</p>`).join('')
				
				modalBody.innerHTML = `<h3>${title}</h3>${htmlContent}`
				modal.classList.remove('hidden')
			}
		})
	})
})

