import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Camera,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, supabaseConfigError } from './lib/supabase'
import './App.css'

const categories = ['All pieces', 'Rings', 'Necklaces', 'Earrings', 'Bracelets']
const currencyFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
})

const productCatalog = [
  { name: 'Sculpted knot hoops', category: 'Earrings' },
  { name: 'Celeste moon pendant', category: 'Necklaces' },
  { name: 'Azure gemstone earrings', category: 'Earrings' },
  { name: 'Everyday gold necklace', category: 'Necklaces' },
  { name: 'Solstice signet ring', category: 'Rings' },
  { name: 'Serein pearl necklace', category: 'Necklaces' },
  { name: 'Luna sculpted hoops', category: 'Earrings' },
  { name: 'Orbit chain bracelet', category: 'Bracelets' },
  { name: 'Marquise gemstone ring', category: 'Rings' },
  { name: 'Seraphina lariat', category: 'Necklaces' },
  { name: 'Petal gold studs', category: 'Earrings' },
  { name: 'Sculpted dome cuff', category: 'Bracelets' },
]

const initialProducts = Array.from({ length: 300 }, (_, index) => {
  const item = productCatalog[index % productCatalog.length]

  return {
    id: index + 1,
    category: item.category,
    name: index < productCatalog.length ? item.name : `${item.name} No. ${String(index + 1).padStart(3, '0')}`,
    price: (98 + ((index * 37) % 310)) * 100,
    image: `/images/jewelry-${String(index + 1).padStart(3, '0')}.webp`,
    badge: index % 11 === 0 ? 'Bestseller' : index % 17 === 0 ? 'Just arrived' : '',
  }
})

function readGuestCart() {
  try {
    const storedCart = JSON.parse(window.localStorage.getItem('aurelia.guest-cart') || '[]')
    return Array.isArray(storedCart)
      ? storedCart.filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0)
      : []
  } catch {
    return []
  }
}

function readGuestWishlist() {
  try {
    const storedWishlist = JSON.parse(window.localStorage.getItem('aurelia.guest-wishlist') || '[]')
    return Array.isArray(storedWishlist) ? storedWishlist.filter(Number.isInteger) : []
  } catch {
    return []
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function formatPrice(price) {
  return currencyFormatter.format(price)
}

const slides = [
  {
    eyebrow: 'The everyday edit · No. 01',
    title: <>A little<br /><em>golden</em> hour.</>,
    copy: 'Jewellery worth slowing down for. Discover the pieces that make every day feel like your own.',
    image: '/images/jewelry-001.webp',
    alt: 'Sculptural gold hoop earrings on pale stone',
    link: 'Shop the collection',
  },
  {
    eyebrow: 'Made to keep · No. 02',
    title: <>Find your<br /><em>own</em> kind of glow.</>,
    copy: 'Thoughtful little details. A softer kind of statement. Beautifully made to be worn your way.',
    image: '/images/jewelry-002.webp',
    alt: 'A gold crescent moon pendant on a soft golden background',
    link: 'Discover necklaces',
  },
  {
    eyebrow: 'Objects with feeling · No. 03',
    title: <>Little things.<br /><em>Big feeling.</em></>,
    copy: 'Meet the pieces you will pass down, lend out, and never want to take off.',
    image: '/images/jewelry-004.webp',
    alt: 'Delicate gold jewellery worn close, layered for everyday',
    link: 'Find your favourite',
  },
]

const collections = [
  { title: 'Rings', subtitle: 'A little something to hold onto', image: '/images/jewelry-005.webp', category: 'Rings' },
  { title: 'Necklaces', subtitle: 'Close to your heart', image: '/images/jewelry-002.webp', category: 'Necklaces' },
  { title: 'Earrings', subtitle: 'The finishing touch', image: '/images/jewelry-003.webp', category: 'Earrings' },
  { title: 'Bracelets', subtitle: 'A gentle reminder', image: '/images/jewelry-008.webp', category: 'Bracelets' },
]

const wardrobeStories = [
  { number: '01', title: 'The one you never take off', image: '/images/jewelry-006.webp', alt: 'Pearl and gold pendant necklace styled on ruby red velvet', category: 'Necklaces' },
  { number: '02', title: 'A little something to hold', image: '/images/jewelry-005.webp', alt: 'Gold ring photographed on soft white fabric', category: 'Rings' },
  { number: '03', title: 'For the way you show up', image: '/images/jewelry-007.webp', alt: 'Blue topaz and diamond earrings on a reflective surface', category: 'Earrings' },
]

const journalStories = [
  { label: 'THE LITTLE THINGS', title: 'An ode to your everyday pieces', image: '/images/jewelry-004.webp', alt: 'Fine gold jewellery layered together', copy: 'The pieces you wear on repeat have a way of becoming part of the story.' },
  { label: 'A NOTE ON GIVING', title: 'A gift that feels like them', image: '/images/jewelry-010.webp', alt: 'Fine gold necklaces and earrings displayed together', copy: 'A few thoughtful ideas for marking the moments worth remembering.' },
  { label: 'CARE & KEEPING', title: 'Make your favourite things last', image: '/images/jewelry-012.webp', alt: 'Delicate bracelet jewellery, beautifully finished', copy: 'A gentle guide to looking after the pieces you love to wear.' },
]

const customerNotes = [
  { quote: 'It arrived beautifully wrapped and somehow felt like it was made just for me.', name: 'Sophie R.', product: 'The Luna hoops' },
  { quote: 'My everyday necklace. I take it off only to sleep, and even then I miss it.', name: 'Amina K.', product: 'The Celeste pendant' },
  { quote: 'The little details, the weight, the finish — it feels so special but never too much.', name: 'Clara M.', product: 'The Solstice ring' },
]

const faqItems = [
  { question: 'When will my order arrive?', answer: 'We carefully pack every piece by hand. Standard shipping usually arrives within 3–5 business days; you will receive a tracking link as soon as your parcel is on its way.' },
  { question: 'How should I look after my jewellery?', answer: 'Keep your pieces somewhere dry, put them on after perfumes and lotions have settled, and give them a gentle wipe with a soft cloth after wearing.' },
  { question: 'Can I send an order as a gift?', answer: 'Absolutely. Every order arrives in our signature gift box, with the option to add a handwritten note at checkout.' },
  { question: 'What if it is not quite right?', answer: 'Unworn pieces can be returned within 30 days of delivery. Get in touch with our little customer-care team and we will help.' },
]

function ProductCard({ product, isSaved, onToggleSave, onAddToBag }) {
  return (
    <motion.article
      className="product-card"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={product.image}
          alt={product.alt || `${product.name}, ${product.category.toLowerCase()} by Aurelia`}
          loading="lazy"
          width="1400"
          height="1680"
        />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        <button
          className={`product-card__save${isSaved ? ' is-saved' : ''}`}
          type="button"
          onClick={() => onToggleSave(product.id)}
          aria-label={isSaved ? `Remove ${product.name} from favourites` : `Save ${product.name} to favourites`}
          aria-pressed={isSaved}
        >
          <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} strokeWidth={1.6} />
        </button>
        <button className="product-card__quick-add" type="button" onClick={() => onAddToBag(product)}>
          <Plus size={16} strokeWidth={1.5} />
          Add to bag
        </button>
      </div>
      <div className="product-card__info">
        <div>
          <p className="product-card__category">{product.category}</p>
          <h3>{product.name}</h3>
        </div>
        <span>{formatPrice(product.price)}</span>
      </div>
    </motion.article>
  )
}

function App() {
  const newsletterStatus = new URLSearchParams(window.location.search).get('newsletter')
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeCategory, setActiveCategory] = useState('All pieces')
  const [visibleCount, setVisibleCount] = useState(8)
  const [catalogProducts, setCatalogProducts] = useState(initialProducts)
  const [session, setSession] = useState(null)
  const [savedProducts, setSavedProducts] = useState(() => new Set(readGuestWishlist()))
  const [cartItems, setCartItems] = useState(readGuestCart)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [addedProduct, setAddedProduct] = useState('')
  const [subscribed] = useState(newsletterStatus === 'confirmed')
  const [activeFaq, setActiveFaq] = useState(0)
  const [accountOpen, setAccountOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [storeError, setStoreError] = useState('')
  const [customerOrders, setCustomerOrders] = useState([])
  const [shippingName, setShippingName] = useState('')
  const [shippingPhone, setShippingPhone] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingPostalCode, setShippingPostalCode] = useState('')
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkoutReceipt, setCheckoutReceipt] = useState(null)
  const [newsletterMessage, setNewsletterMessage] = useState(() => {
    if (newsletterStatus === 'confirmed') return 'Thanks for confirming. You are on the list.'
    if (newsletterStatus === 'invalid' || newsletterStatus === 'error') {
      return 'That confirmation link has expired or could not be verified. Sign up again for a fresh link.'
    }
    return ''
  })
  const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState('')
  const [newsletterBusy, setNewsletterBusy] = useState(false)
  const userId = session?.user?.id

  const bagCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems],
  )

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => {
      const product = catalogProducts.find((entry) => entry.id === item.productId)
      return total + (product ? product.price * item.quantity : 0)
    }, 0),
    [cartItems, catalogProducts],
  )

  const cartProducts = useMemo(
    () => cartItems
      .map((item) => ({
        ...item,
        product: catalogProducts.find((product) => product.id === item.productId),
      }))
      .filter((item) => item.product),
    [cartItems, catalogProducts],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6500)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('newsletter')) {
      url.searchParams.delete('newsletter')
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!active) return
        if (error) {
          setStoreError(`Could not restore your sign-in: ${error.message}`)
          return
        }
        setSession(data.session)
      } catch (error) {
        if (active) setStoreError(`Could not restore your sign-in: ${getErrorMessage(error)}`)
      }
    }

    void loadSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setCartItems(readGuestCart())
        setSavedProducts(new Set(readGuestWishlist()))
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, price_paisa, image_path, image_alt, badge')
          .order('id')

        if (!active) return
        if (error) {
          setStoreError(`Could not load products from Supabase: ${error.message}`)
          return
        }

        setCatalogProducts(data.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price_paisa / 100,
          image: `/images/${product.image_path}`,
          alt: product.image_alt,
          badge: product.badge,
        })))
        if (data.length === 0) {
          setStoreError('The Supabase products table is empty. Run supabase/seed.sql to add the 300 products.')
        }
      } catch (error) {
        if (active) setStoreError(`Could not load products from Supabase: ${getErrorMessage(error)}`)
      }
    }

    void loadProducts()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!supabase || !userId) return undefined

    let active = true
    const loadCustomerData = async () => {
      try {
        const [cartResult, wishlistResult, ordersResult] = await Promise.all([
          supabase.from('cart_items').select('product_id, quantity').eq('user_id', userId),
          supabase.from('wishlist_items').select('product_id').eq('user_id', userId),
          supabase
            .from('orders')
            .select('id, status, payment_status, total_paisa, created_at, order_items(product_name, quantity, unit_price_paisa)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10),
        ])

        if (!active) return
        if (cartResult.error || wishlistResult.error || ordersResult.error) {
          const error = cartResult.error || wishlistResult.error || ordersResult.error
          setStoreError(`Could not load your saved bag, favourites, and orders: ${error.message}`)
          return
        }

        const mergedCart = new Map(
          cartResult.data.map((item) => [item.product_id, item.quantity]),
        )
        for (const item of readGuestCart()) {
          mergedCart.set(item.productId, Math.min(99, (mergedCart.get(item.productId) || 0) + item.quantity))
        }

        const guestCart = [...mergedCart].map(([productId, quantity]) => ({ productId, quantity }))
        const guestWishlist = new Set([
          ...wishlistResult.data.map((item) => item.product_id),
          ...readGuestWishlist(),
        ])
        const cartChanged = guestCart.some((item) =>
          cartResult.data.find((saved) => saved.product_id === item.productId)?.quantity !== item.quantity,
        )
        const wishlistChanged = guestWishlist.size !== wishlistResult.data.length

        if (cartChanged) {
          const { error } = await supabase.from('cart_items').upsert(
            guestCart.map((item) => ({ user_id: userId, product_id: item.productId, quantity: item.quantity })),
            { onConflict: 'user_id,product_id' },
          )
          if (error) {
            if (active) setStoreError(`Could not merge your guest shopping bag: ${error.message}`)
            return
          }
        }
        if (wishlistChanged) {
          const guestOnlyWishlist = [...guestWishlist]
            .filter((productId) => !wishlistResult.data.some((item) => item.product_id === productId))
          if (guestOnlyWishlist.length) {
            const { error } = await supabase.from('wishlist_items').upsert(
              guestOnlyWishlist.map((productId) => ({ user_id: userId, product_id: productId })),
              { onConflict: 'user_id,product_id', ignoreDuplicates: true },
            )
            if (error) {
              if (active) setStoreError(`Could not merge your guest favourites: ${error.message}`)
              return
            }
          }
        }

        if (!active) return
        window.localStorage.removeItem('aurelia.guest-cart')
        window.localStorage.removeItem('aurelia.guest-wishlist')
        setCartItems(guestCart)
        setSavedProducts(guestWishlist)
        setCustomerOrders(ordersResult.data)
      } catch (error) {
        if (active) setStoreError(`Could not load your saved bag and favourites: ${getErrorMessage(error)}`)
      }
    }

    void loadCustomerData()
    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    if (!addedProduct) return undefined

    const timer = window.setTimeout(() => setAddedProduct(''), 2400)
    return () => window.clearTimeout(timer)
  }, [addedProduct])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return catalogProducts.filter((product) => {
      const matchesCategory = activeCategory === 'All pieces' || product.category === activeCategory
      const matchesSearch = !normalizedSearch
        || `${product.name} ${product.category}`.toLowerCase().includes(normalizedSearch)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, catalogProducts, searchTerm])

  const selectCategory = (category) => {
    setActiveCategory(category)
    setVisibleCount(8)
    setMenuOpen(false)
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  const saveGuestData = (nextCart, nextWishlist) => {
    if (userId) return

    try {
      window.localStorage.setItem('aurelia.guest-cart', JSON.stringify(nextCart))
      window.localStorage.setItem('aurelia.guest-wishlist', JSON.stringify(nextWishlist))
    } catch (error) {
      setStoreError(`Could not save your guest shopping data in this browser: ${getErrorMessage(error)}`)
    }
  }

  const toggleSaved = async (id) => {
    const isSaved = savedProducts.has(id)

    if (supabase && session?.user) {
      try {
        const result = isSaved
          ? await supabase.from('wishlist_items').delete().eq('user_id', session.user.id).eq('product_id', id)
          : await supabase.from('wishlist_items').insert({ user_id: session.user.id, product_id: id })
        if (result.error) {
          setStoreError(`Could not update your favourites: ${result.error.message}`)
          return
        }
      } catch (error) {
        setStoreError(`Could not update your favourites: ${getErrorMessage(error)}`)
        return
      }
    }

    const nextSaved = new Set(savedProducts)
    if (isSaved) nextSaved.delete(id)
    else nextSaved.add(id)
    setSavedProducts(nextSaved)
    saveGuestData(cartItems, [...nextSaved])
  }

  const addToBag = async (product) => {
    const existingItem = cartItems.find((item) => item.productId === product.id)
    const currentQuantity = existingItem?.quantity || 0
    let quantity = currentQuantity + 1

    if (supabase && session?.user) {
      try {
        const { data, error } = await supabase.rpc('add_product_to_cart', { p_product_id: product.id })
        if (error) {
          setStoreError(`Could not update your shopping bag: ${error.message}`)
          return
        }
        quantity = data
        if (quantity === currentQuantity) {
          setStoreError('You can add up to 99 of the same piece to your bag.')
          return
        }
      } catch (error) {
        setStoreError(`Could not update your shopping bag: ${getErrorMessage(error)}`)
        return
      }
    } else if (quantity > 99) {
      setStoreError('You can add up to 99 of the same piece to your bag.')
      return
    }

    const nextCart = existingItem
      ? cartItems.map((item) => item.productId === product.id ? { ...item, quantity } : item)
      : [...cartItems, { productId: product.id, quantity }]
    setCartItems(nextCart)
    saveGuestData(nextCart, [...savedProducts])
    setCheckoutReceipt(null)
    setCheckoutMessage('')
    setAddedProduct(product.name)
  }

  const updateCartQuantity = async (productId, quantity) => {
    if (supabase && session?.user) {
      try {
        const result = quantity === 0
          ? await supabase.from('cart_items').delete().eq('user_id', session.user.id).eq('product_id', productId)
          : await supabase.from('cart_items').upsert(
            { user_id: session.user.id, product_id: productId, quantity },
            { onConflict: 'user_id,product_id' },
          )
        if (result.error) {
          setStoreError(`Could not update your shopping bag: ${result.error.message}`)
          return
        }
      } catch (error) {
        setStoreError(`Could not update your shopping bag: ${getErrorMessage(error)}`)
        return
      }
    }

    const nextCart = quantity === 0
      ? cartItems.filter((item) => item.productId !== productId)
      : cartItems.map((item) => item.productId === productId ? { ...item, quantity } : item)
    setCartItems(nextCart)
    saveGuestData(nextCart, [...savedProducts])
    setCheckoutMessage('')
  }

  const placeCodOrder = async (event) => {
    event.preventDefault()
    setCheckoutMessage('')
    if (!supabase || !session?.user) {
      setCheckoutMessage('Sign in before placing a cash-on-delivery order.')
      return
    }

    setCheckoutBusy(true)
    try {
      const { data, error } = await supabase.rpc('place_cod_order', {
        p_shipping_name: shippingName.trim(),
        p_phone: shippingPhone.trim(),
        p_address_line: shippingAddress.trim(),
        p_city: shippingCity.trim(),
        p_postal_code: shippingPostalCode.trim(),
      })
      if (error) {
        setCheckoutMessage(error.message)
        return
      }
      const order = data?.[0]
      if (!order?.order_id) {
        setCheckoutMessage('The order was not confirmed. Your bag has not been cleared.')
        return
      }

      const receipt = {
        id: order.order_id,
        total: order.total_paisa / 100,
      }
      setCheckoutReceipt(receipt)
      setCheckoutMessage('')
      setCartItems([])
      setCartOpen(true)

      const { data: latestOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, payment_status, total_paisa, created_at, order_items(product_name, quantity, unit_price_paisa)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (ordersError) setStoreError(`Your order was placed, but order history could not be refreshed: ${ordersError.message}`)
      else setCustomerOrders(latestOrders)
    } catch (error) {
      setCheckoutMessage(`Could not place the order: ${getErrorMessage(error)}`)
    } finally {
      setCheckoutBusy(false)
    }
  }

  const subscribeToNewsletter = async (event) => {
    event.preventDefault()
    setNewsletterMessage('')
    setNewsletterSuccessMessage('')
    if (!supabase) {
      setNewsletterMessage(supabaseConfigError || 'Connect your Supabase project before subscribing.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('newsletter-email') || '').trim()
    setNewsletterBusy(true)

    try {
      const { data, error } = await supabase.functions.invoke('newsletter', {
        body: { action: 'subscribe', email, consent: formData.get('newsletter-consent') === 'on' },
      })
      if (error) {
        let detail = error.message
        try {
          const response = await error.context?.json()
          if (response?.error) detail = response.error
        } catch {
          detail = error.message
        }
        setNewsletterMessage(detail)
        return
      }
      setNewsletterSuccessMessage(data?.message || 'Check your inbox for a confirmation link.')
    } catch (error) {
      setNewsletterMessage(`Newsletter signup failed: ${getErrorMessage(error)}`)
    } finally {
      setNewsletterBusy(false)
    }
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthMessage('')
    setAuthBusy(true)

    if (!supabase) {
      setAuthMessage(supabaseConfigError || 'Connect your Supabase project using the setup guide before signing in.')
      setAuthBusy(false)
      return
    }

    try {
      const result = authMode === 'signup'
        ? await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { emailRedirectTo: window.location.origin },
        })
        : await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        })

      if (result.error) {
        setAuthMessage(result.error.message)
      } else if (authMode === 'signup' && !result.data.session) {
        setAuthMessage('Check your email to confirm your new account, then sign in here.')
        setAuthPassword('')
      } else {
        setAccountOpen(false)
        setAuthPassword('')
      }
    } catch (error) {
      setAuthMessage(`Sign-in failed: ${getErrorMessage(error)}`)
    } finally {
      setAuthBusy(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setAuthMessage(`Could not sign out: ${error.message}`)
        return
      }
    } catch (error) {
      setAuthMessage(`Could not sign out: ${getErrorMessage(error)}`)
      return
    }
    setAccountOpen(false)
    setAuthMessage('')
    setCartItems(readGuestCart())
    setSavedProducts(new Set(readGuestWishlist()))
  }

  const changeSlide = (direction) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length)
  }

  const slide = slides[activeSlide]

  return (
    <div className="storefront">
      <div className="announcement">
        <span>Complimentary shipping on orders over $150</span>
        <span className="announcement__separator">·</span>
        <a href="#our-story">A little more about us <ArrowUpRight size={12} /></a>
      </div>

      <header className="site-header">
        <div className="site-header__inner">
          <button
            className="icon-button mobile-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <a className="wordmark" href="#home" aria-label="Aurelia home">
            <span className="wordmark__name">aurelia</span>
            <span className="wordmark__tagline">OBJECTS TO KEEP</span>
          </a>

          <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            <a href="#shop" onClick={() => setMenuOpen(false)}>Shop all</a>
            <a href="#collections" onClick={() => setMenuOpen(false)}>Collections</a>
            <a href="#our-story" onClick={() => setMenuOpen(false)}>Our story</a>
            <a href="#journal" onClick={() => setMenuOpen(false)}>The journal</a>
          </nav>

          <div className="header-actions">
            <button
              className="icon-button"
              type="button"
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
              onClick={() => {
                setSearchOpen((open) => !open)
                window.setTimeout(() => document.getElementById('site-search')?.focus(), 0)
              }}
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>
            <button
              className="icon-button header-account"
              type="button"
              aria-label={session?.user ? `Your account, ${session.user.email}` : 'Sign in or create an account'}
              aria-expanded={accountOpen}
              onClick={() => {
                setAuthMessage('')
                setAccountOpen(true)
              }}
            >
              <UserRound size={19} />
            </button>
            <button
              className="bag-button"
              type="button"
              aria-label={`Shopping bag, ${bagCount} items`}
              aria-expanded={cartOpen}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={19} strokeWidth={1.55} />
              <span>Bag</span>
              <span className="bag-count">{bagCount}</span>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {searchOpen && (
            <motion.form
              className="search-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={(event) => {
                event.preventDefault()
                setSearchOpen(false)
                document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Search size={19} />
              <input
                id="site-search"
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setVisibleCount(8)
                }}
                placeholder="Try “gold hoops” or “necklace”"
                aria-label="Search jewellery"
              />
              <button type="submit">Search</button>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="hero" id="home" aria-label="Featured collection">
          <div className="hero__content">
            <p className="hero__edition"><span>01</span> AURELIA ATELIER</p>
            <motion.p
              className="eyebrow hero__eyebrow"
              key={`eyebrow-${activeSlide}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.55 }}
            >
              <span className="eyebrow__line" />{slide.eyebrow}
            </motion.p>
            <motion.h1
              key={`title-${activeSlide}`}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            >
              {slide.title}
            </motion.h1>
            <motion.p
              className="hero__copy"
              key={`copy-${activeSlide}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.6 }}
            >
              {slide.copy}
            </motion.p>
            <motion.a
              className="button button--light"
              href="#shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.55 }}
            >
              {slide.link}<ArrowRight size={16} strokeWidth={1.5} />
            </motion.a>
          </div>
          <div className="hero__media">
            <AnimatePresence mode="wait">
              <motion.img
                key={slide.image}
                className="hero__image"
                src={slide.image}
                alt={slide.alt}
                width="1400"
                height="1680"
                fetchPriority="high"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </AnimatePresence>
            <span className="hero__image-note"><Sparkles size={15} /> Made for the everyday</span>
            <div className="hero__floating-stamp" aria-hidden="true">
              <span className="hero__stamp-orbit"><Sparkles size={16} /></span>
              <span>kept close<br />worn often<br />loved always</span>
            </div>
            <div className="hero__controls">
              <span className="hero__counter"><b>0{activeSlide + 1}</b><span />0{slides.length}</span>
              <div className="hero__arrows">
                <button type="button" onClick={() => changeSlide(-1)} aria-label="Previous slide">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={() => changeSlide(1)} aria-label="Next slide">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="promise-strip" aria-label="Our promise">
          <span>Made to be worn</span><i />
          <span>Made to be kept</span><i />
          <span>Made for your story</span><i />
          <span>Made to be worn</span>
        </section>

        <section className="intro-section" id="our-story">
          <motion.div
            className="intro-section__mark"
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          >
            <span>JEWELLERY WITH FEELING · JEWELLERY WITH FEELING · </span>
          </motion.div>
          <div className="intro-section__text">
            <p className="eyebrow"><span className="eyebrow__line" />A more personal kind of polish</p>
            <h2>Not saved for<br />a <em>special occasion.</em></h2>
            <p>
              The everyday pieces that make an ordinary Tuesday feel a little like yours.
              Thoughtfully made, endlessly loved, and all the better for being worn.
            </p>
            <a className="text-link" href="#collections">Get to know Aurelia <ArrowUpRight size={15} /></a>
          </div>
          <div className="intro-section__visual">
            <img src="/images/jewelry-004.webp" alt="A fine gold necklace layered for everyday wear" loading="lazy" />
            <span className="intro-section__caption">01 / An everyday heirloom</span>
            <Sparkles className="intro-section__sparkle intro-section__sparkle--one" size={27} strokeWidth={1} aria-hidden="true" />
            <Sparkles className="intro-section__sparkle intro-section__sparkle--two" size={24} strokeWidth={1} aria-hidden="true" />
          </div>
        </section>

        <section className="collections-section" id="collections">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow__line" />Find your kind of lovely</p>
              <h2>Made for your <em>every day.</em></h2>
            </div>
            <a className="text-link section-heading__link" href="#shop">Shop all 300 pieces <ArrowUpRight size={15} /></a>
          </div>
          <div className="collection-grid">
            {collections.map((collection, index) => (
              <motion.button
                className="collection-card"
                key={collection.title}
                type="button"
                onClick={() => selectCategory(collection.category)}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <img src={collection.image} alt="" loading="lazy" />
                <span className="collection-card__shade" />
                <span className="collection-card__text">
                  <small>{collection.subtitle}</small>
                  <span>{collection.title}<ArrowUpRight size={16} /></span>
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading shop-section__heading">
            <div>
              <p className="eyebrow"><span className="eyebrow__line" />A few things we think you will love</p>
              <h2>The little <em>good things.</em></h2>
            </div>
            <span className="shop-section__count">300 pieces, one for every version of you</span>
          </div>

          <div className="category-tabs" role="group" aria-label="Filter by jewellery type">
            {categories.map((category) => (
              <button
                className={activeCategory === category ? 'is-active' : ''}
                type="button"
                key={category}
                aria-pressed={activeCategory === category}
                onClick={() => {
                  setActiveCategory(category)
                  setVisibleCount(8)
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            <motion.div className="product-grid" layout>
              <AnimatePresence mode="popLayout">
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSaved={savedProducts.has(product.id)}
                    onToggleSave={toggleSaved}
                    onAddToBag={addToBag}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="empty-search">
              <p>{searchTerm ? `No pieces found for “${searchTerm}”.` : 'No pieces are available right now.'}</p>
              {searchTerm && (
                <button type="button" className="text-link" onClick={() => setSearchTerm('')}>Clear your search <ArrowRight size={15} /></button>
              )}
            </div>
          )}

          {filteredProducts.length > visibleCount && (
            <button
              className="button button--outline shop-section__more"
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + 8, filteredProducts.length))}
            >
              Discover more pieces <ArrowRight size={16} />
            </button>
          )}
        </section>

        <section className="wardrobe-section" aria-labelledby="wardrobe-title">
          <div className="wardrobe-section__heading">
            <p className="eyebrow"><span className="eyebrow__line" />A few chapters in your jewellery story</p>
            <h2 id="wardrobe-title">One for every<br /><em>little moment.</em></h2>
            <p>These are the ones that find their way into every photograph, every plan, and every version of you.</p>
          </div>
          <div className="wardrobe-grid">
            {wardrobeStories.map((story, index) => (
              <motion.button
                className={`wardrobe-card wardrobe-card--${index + 1}`}
                key={story.number}
                type="button"
                onClick={() => selectCategory(story.category)}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <span className="wardrobe-card__number">{story.number}</span>
                <img src={story.image} alt={story.alt} loading="lazy" width="1400" height="1680" />
                <span className="wardrobe-card__caption">
                  <span>{story.title}</span><ArrowUpRight size={17} />
                </span>
              </motion.button>
            ))}
          </div>
          <a className="text-link wardrobe-section__link" href="#collections">Explore the collections <ArrowRight size={15} /></a>
        </section>

        <section className="atelier-section" aria-labelledby="atelier-title">
          <div className="atelier-section__image">
            <img src="/images/jewelry-012.webp" alt="Thoughtfully finished bracelet, up close" loading="lazy" width="1400" height="1680" />
            <span>THE AURELIA WAY · EST. WITH INTENTION</span>
          </div>
          <div className="atelier-section__copy">
            <p className="eyebrow"><span className="eyebrow__line" />A little more thought in every detail</p>
            <h2 id="atelier-title">Made slowly.<br /><em>Worn forever.</em></h2>
            <p className="atelier-section__intro">We believe the best things are never rushed. So we take our time with every little detail, from the first sketch to the last polish.</p>
            <div className="atelier-steps">
              <div><span>01</span><p><strong>Drawn by hand</strong><br />Every piece starts as a little idea in our studio.</p></div>
              <div><span>02</span><p><strong>Considered materials</strong><br />We choose pieces you will want to wear again and again.</p></div>
              <div><span>03</span><p><strong>Finished with care</strong><br />A final, thoughtful polish before it finds its way to you.</p></div>
            </div>
            <a className="text-link" href="#our-story">A little more about Aurelia <ArrowUpRight size={15} /></a>
          </div>
        </section>

        <section className="customer-notes" aria-labelledby="customer-notes-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow__line" />Lovely things, lovely people</p>
              <h2 id="customer-notes-title">A note from <em>you.</em></h2>
            </div>
            <p className="customer-notes__aside">A few words from our little corner of the world.</p>
          </div>
          <div className="customer-note-grid">
            {customerNotes.map((note) => (
              <article className="customer-note" key={note.name}>
                <span className="customer-note__stars" aria-label="5 out of 5 stars">★★★★★</span>
                <blockquote>“{note.quote}”</blockquote>
                <p className="customer-note__name">{note.name}</p>
                <p className="customer-note__product">{note.product}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="journal-section" id="journal" aria-labelledby="journal-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow__line" />Notes from our little world</p>
              <h2 id="journal-title">A little <em>something to read.</em></h2>
            </div>
            <a className="text-link section-heading__link" href="#our-story">Come say hello <ArrowUpRight size={15} /></a>
          </div>
          <div className="journal-grid">
            {journalStories.map((story, index) => (
              <motion.article
                className="journal-card"
                key={story.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <a className="journal-card__image" href="#our-story" aria-label={`Read: ${story.title}`}>
                  <img src={story.image} alt={story.alt} loading="lazy" width="1400" height="1680" />
                  <span><ArrowUpRight size={17} /></span>
                </a>
                <p className="journal-card__label">{story.label}</p>
                <h3><a href="#our-story">{story.title}</a></h3>
                <p className="journal-card__copy">{story.copy}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="faq-section" aria-labelledby="faq-title">
          <div className="faq-section__intro">
            <p className="eyebrow"><span className="eyebrow__line" />A few helpful things</p>
            <h2 id="faq-title">Good to <em>know.</em></h2>
            <p>Not sure about something? We have made a little space for the practical details.</p>
            <a className="text-link" href="mailto:hello@aurelia.example">Ask us anything <ArrowUpRight size={15} /></a>
          </div>
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div className={`faq-item${activeFaq === index ? ' is-open' : ''}`} key={item.question}>
                <h3>
                  <button
                    type="button"
                    id={`faq-question-${index}`}
                    aria-expanded={activeFaq === index}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                  >
                    {item.question}<span aria-hidden="true">{activeFaq === index ? '−' : '+'}</span>
                  </button>
                </h3>
                <div
                  className="faq-item__answer"
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  hidden={activeFaq !== index}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="quote-section" id="founder-note">
          <div className="quote-section__image">
            <img src="/images/jewelry-002.webp" alt="Gold pendant jewellery in warm golden light" loading="lazy" />
            <span className="quote-section__image-note">The good things are in the details</span>
          </div>
          <div className="quote-section__copy">
            <Sparkles className="quote-section__star" size={30} strokeWidth={1} aria-hidden="true" />
            <p className="eyebrow">A note from our founder</p>
            <blockquote>“The pieces you wear the most should feel a little like <em>you.</em>”</blockquote>
            <p className="quote-section__signature">With love, Amelia</p>
            <a className="text-link" href="#our-story">Read our story <ArrowUpRight size={15} /></a>
          </div>
        </section>

        <section className="social-gallery" aria-labelledby="social-title">
          <div className="social-gallery__heading">
            <p className="eyebrow"><span className="eyebrow__line" />A little inspiration from the atelier</p>
            <h2 id="social-title">Found in the <em>everyday.</em></h2>
            <a className="text-link" href="#collections">Discover the little details <ArrowUpRight size={15} /></a>
          </div>
          <div className="social-gallery__grid">
            {Array.from({ length: 6 }, (_, index) => {
              const imageId = index + 1
              const product = catalogProducts[index]

              return (
                <a className="social-gallery__tile" href="#shop" key={product.id}>
                  <img src={`/images/jewelry-${String(imageId).padStart(3, '0')}.webp`} alt={product.name} loading="lazy" width="1400" height="1680" />
                  <span><ArrowUpRight size={17} /></span>
                </a>
              )
            })}
          </div>
        </section>

        <section className="newsletter">
          <div className="newsletter__decoration" aria-hidden="true">a</div>
          <div className="newsletter__content">
            <p className="eyebrow"><span className="eyebrow__line" />A little note now and then</p>
            <h2>Good things, <em>in your inbox.</em></h2>
            <p>First looks, thoughtful things, and new arrivals. Nothing noisy.</p>
            {subscribed ? (
              <p className="newsletter__success" role="status"><Check size={17} /> {newsletterMessage || 'You are on the list. Lovely to have you.'}</p>
            ) : (
              <form className="newsletter__form" onSubmit={subscribeToNewsletter}>
                <label className="visually-hidden" htmlFor="newsletter-email">Your email address</label>
                <input id="newsletter-email" name="newsletter-email" type="email" placeholder="Your email address" autoComplete="email" required />
                <button type="submit" aria-label="Subscribe to the newsletter" disabled={newsletterBusy}>
                  {newsletterBusy ? '…' : <ArrowRight size={19} />}
                </button>
                <label className="newsletter__consent">
                  <input name="newsletter-consent" type="checkbox" required />
                  <span>I agree to receive occasional Aurelia emails.</span>
                </label>
              </form>
            )}
            {!subscribed && newsletterSuccessMessage && (
              <p className="newsletter__success" role="status"><Check size={17} /> {newsletterSuccessMessage}</p>
            )}
            {!subscribed && newsletterMessage && <p className="newsletter__message" role="alert">{newsletterMessage}</p>}
          </div>
          <div className="newsletter__note">AURELIA<br />LETTERS<br /><span>VOL. 01</span></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__main">
          <div className="site-footer__brand">
            <a className="wordmark wordmark--footer" href="#home">
              <span className="wordmark__name">aurelia</span>
              <span className="wordmark__tagline">OBJECTS TO KEEP</span>
            </a>
            <p>Little things, made meaningful.<br />Made for you, and all the days in between.</p>
            <a className="footer-social" href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Visit Instagram">
              <Camera size={17} /><span>Follow along</span><ArrowUpRight size={13} />
            </a>
          </div>
          <div className="site-footer__links">
            <div><h3>Explore</h3><a href="#shop">Shop all</a><a href="#collections">Collections</a><a href="#shop">Best sellers</a><a href="#shop">Gift cards</a></div>
            <div><h3>Here to help</h3><a href="#our-story">Contact us</a><a href="#our-story">Shipping & returns</a><a href="#our-story">Care guide</a><a href="#our-story">FAQs</a></div>
            <div><h3>The little details</h3><a href="#our-story">Our story</a><a href="#journal">Journal</a><a href="#our-story">Materials & care</a><a href="#our-story">Sustainability</a></div>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© 2026 Aurelia Jewellery</span>
          <span>Made with intention, worn with love.</span>
          <div><a href="#home">Privacy</a><a href="#home">Terms</a><a href="#home">Shipping</a></div>
        </div>
      </footer>

      <AnimatePresence>
        {accountOpen && (
          <motion.div
            className="store-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setAccountOpen(false)
            }}
          >
            <motion.section
              className="account-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-panel-title"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
            >
              <div className="store-panel__heading">
                <div>
                  <p className="eyebrow"><span className="eyebrow__line" />Your Aurelia account</p>
                  <h2 id="account-panel-title">{session?.user ? 'Lovely to see you.' : 'Welcome, lovely.'}</h2>
                </div>
                <button className="store-panel__close" type="button" aria-label="Close account panel" onClick={() => setAccountOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {!supabase ? (
                <>
                  <p className="account-panel__status account-panel__status--offline" role="status">
                    {supabaseConfigError || 'Supabase is not connected yet. Add your project URL and publishable key to .env.local.'}
                  </p>
                  <p className="account-panel__help">Follow <strong>SUPABASE_SETUP.md</strong> to connect the database, then restart the development server.</p>
                </>
              ) : session?.user ? (
                <>
                  <p className="account-panel__email">{session.user.email}</p>
                  <p className="account-panel__status">Your favourites and shopping bag are saved to your account.</p>
                  <div className="account-orders">
                    <h3>Recent orders</h3>
                    {customerOrders.length === 0 ? (
                      <p>You do not have any orders yet.</p>
                    ) : customerOrders.map((order) => (
                      <article className="account-order" key={order.id}>
                        <div>
                          <strong>Order {order.id.slice(0, 8).toUpperCase()}</strong>
                          <span>{new Date(order.created_at).toLocaleDateString('en-PK')}</span>
                        </div>
                        <div>
                          <span>{order.status} · cash on delivery</span>
                          <strong>{formatPrice(order.total_paisa / 100)}</strong>
                        </div>
                        <p>{order.order_items.map((item) => `${item.product_name} × ${item.quantity}`).join(', ')}</p>
                      </article>
                    ))}
                  </div>
                  <button className="button button--outline account-panel__signout" type="button" onClick={signOut}>
                    Sign out
                  </button>
                  {authMessage && <p className="store-form__message" role="alert">{authMessage}</p>}
                </>
              ) : (
                <>
                  <p className="account-panel__status">Sign in to keep your favourites and shopping bag with you.</p>
                  <form className="store-form" onSubmit={submitAuth}>
                    <label htmlFor="account-email">Email address</label>
                    <input
                      id="account-email"
                      type="email"
                      autoComplete="email"
                      value={authEmail}
                      onChange={(event) => setAuthEmail(event.target.value)}
                      required
                    />
                    <label htmlFor="account-password">Password</label>
                    <input
                      id="account-password"
                      type="password"
                      autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                      minLength={6}
                      value={authPassword}
                      onChange={(event) => setAuthPassword(event.target.value)}
                      required
                    />
                    {authMessage && <p className="store-form__message" role="alert">{authMessage}</p>}
                    <button className="button button--outline store-form__submit" type="submit" disabled={authBusy || !supabase}>
                      {authBusy ? 'One moment…' : authMode === 'signup' ? 'Create account' : 'Sign in'}
                    </button>
                  </form>
                  <button
                    className="account-panel__switch"
                    type="button"
                    onClick={() => {
                      setAuthMode((mode) => mode === 'signin' ? 'signup' : 'signin')
                      setAuthMessage('')
                    }}
                  >
                    {authMode === 'signup' ? 'Already have an account? Sign in' : 'New to Aurelia? Create an account'}
                  </button>
                </>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <motion.div
            className="store-overlay store-overlay--drawer"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setCartOpen(false)
            }}
          >
            <motion.aside
              className="cart-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-drawer-title"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="store-panel__heading">
                <div>
                  <p className="eyebrow"><span className="eyebrow__line" />A little something for you</p>
                  <h2 id="cart-drawer-title">Your bag <span>({bagCount})</span></h2>
                </div>
                <button className="store-panel__close" type="button" aria-label="Close shopping bag" onClick={() => setCartOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {cartProducts.length === 0 ? checkoutReceipt ? (
                <div className="order-confirmation" role="status">
                  <Check size={26} />
                  <h3>Your order is confirmed.</h3>
                  <p>Order {checkoutReceipt.id.slice(0, 8).toUpperCase()}</p>
                  <p>Cash due on delivery: <strong>{formatPrice(checkoutReceipt.total)}</strong></p>
                  <p>You can find your order in your Aurelia account.</p>
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => {
                      setCartOpen(false)
                      setAccountOpen(true)
                    }}
                  >View your account <ArrowRight size={15} /></button>
                </div>
              ) : (
                <div className="cart-drawer__empty">
                  <ShoppingBag size={26} strokeWidth={1.3} />
                  <p>Your bag is taking a little breather.</p>
                  <button className="text-link" type="button" onClick={() => setCartOpen(false)}>Keep exploring <ArrowRight size={15} /></button>
                </div>
              ) : (
                <>
                  <div className="cart-drawer__items">
                    {cartProducts.map(({ product, quantity }) => (
                      <article className="cart-item" key={product.id}>
                        <img src={product.image} alt={product.alt || product.name} width="1400" height="1680" />
                        <div className="cart-item__details">
                          <p>{product.category}</p>
                          <h3>{product.name}</h3>
                          <span>{formatPrice(product.price)}</span>
                          <div className="cart-item__controls">
                            <button
                              type="button"
                              aria-label={`Remove one ${product.name}`}
                              onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            >−</button>
                            <span>{quantity}</span>
                            <button
                              type="button"
                              aria-label={`Add one ${product.name}`}
                              disabled={quantity >= 99}
                              onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            >+</button>
                            <button
                              className="cart-item__remove"
                              type="button"
                              aria-label={`Remove ${product.name} from bag`}
                              onClick={() => updateCartQuantity(product.id, 0)}
                            ><Trash2 size={15} /></button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  <div className="cart-drawer__footer">
                    <div className="cart-drawer__total"><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
                    <p>Shipping details are collected before the order is placed.</p>
                    {session?.user ? (
                      <form className="checkout-form" onSubmit={placeCodOrder}>
                        <h3>Delivery details</h3>
                        <label htmlFor="shipping-name">Full name</label>
                        <input id="shipping-name" autoComplete="name" maxLength={120} value={shippingName} onChange={(event) => setShippingName(event.target.value)} required />
                        <label htmlFor="shipping-phone">Phone number</label>
                        <input id="shipping-phone" type="tel" autoComplete="tel" maxLength={40} value={shippingPhone} onChange={(event) => setShippingPhone(event.target.value)} required />
                        <label htmlFor="shipping-address">Street address</label>
                        <textarea id="shipping-address" autoComplete="street-address" maxLength={300} rows={2} value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} required />
                        <div className="checkout-form__location">
                          <div>
                            <label htmlFor="shipping-city">City</label>
                            <input id="shipping-city" autoComplete="address-level2" maxLength={120} value={shippingCity} onChange={(event) => setShippingCity(event.target.value)} required />
                          </div>
                          <div>
                            <label htmlFor="shipping-postal">Postal code</label>
                            <input id="shipping-postal" autoComplete="postal-code" maxLength={20} value={shippingPostalCode} onChange={(event) => setShippingPostalCode(event.target.value)} />
                          </div>
                        </div>
                        {checkoutMessage && <p className="store-form__message" role="alert">{checkoutMessage}</p>}
                        <button className="button button--outline checkout-form__submit" type="submit" disabled={checkoutBusy || bagCount === 0}>
                          {checkoutBusy ? 'Placing your order…' : `Place COD order · ${formatPrice(cartTotal)}`}
                        </button>
                        <p className="checkout-form__note">Cash on delivery. Please have the order total ready when your parcel arrives.</p>
                      </form>
                    ) : (
                      <div className="cart-drawer__signin">
                        <p>Sign in to enter your delivery details and place a cash-on-delivery order.</p>
                        <button
                          className="button button--outline"
                          type="button"
                          onClick={() => {
                            setCartOpen(false)
                            setAccountOpen(true)
                          }}
                        >Sign in to continue</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addedProduct && (
          <motion.div
            className="bag-toast"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Check size={16} /> {addedProduct} added to your bag
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {storeError && (
          <motion.div
            className="bag-toast store-error-toast"
            role="alert"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <span>{storeError}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setStoreError('')}><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
