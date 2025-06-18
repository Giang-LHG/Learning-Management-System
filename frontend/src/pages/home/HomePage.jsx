import React from 'react'
import Header from '../../components/header/Header'
import HeroSection from '../../components/heroSection/HeroSection' 
import Features from '../../components/features/Features'
import CourseList from '../../components/courseList/CourseList'
import Testimonials from '../../components/testimonials/Testimonials'
import Footer from '../../components/footer/Footer'
import './Homepage.css'

const HomePage = () => {
    return (
        <div className="home-page">
            <Header />
            <main>
                <HeroSection />
                <Features />
                <CourseList />
                <Testimonials />
            </main>
            <Footer />
        </div>
    )
}

export default HomePage