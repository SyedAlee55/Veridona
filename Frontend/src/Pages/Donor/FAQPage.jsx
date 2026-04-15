import React, { useState } from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Grid, Card, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DonorDrawer from '../../components/DonorDrawer';

const FAQPage = () => {
    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const faqs = [
        {
            id: 'panel1',
            question: 'How do I make a donation?',
            answer: 'Visit the Donation Page and enter the amount you wish to donate. Follow the payment instructions to complete your donation securely.'
        },
        {
            id: 'panel2',
            question: 'When will I receive my NFT certificate?',
            answer: 'NFT certificates are generated after your donation is processed and verified. You can claim them from the Claim NFT page once they become available.'
        },
        {
            id: 'panel3',
            question: 'What is an NFT certificate?',
            answer: 'An NFT (Non-Fungible Token) certificate is a blockchain-verified digital certificate proving your donation. It helps track and verify your contribution transparently.'
        },
        {
            id: 'panel4',
            question: 'Can I track my donation?',
            answer: 'Yes! Visit the Track Donation page to see the status of your donation and its impact. You can view real-time updates on how your contribution is being used.'
        },
        {
            id: 'panel5',
            question: 'Is my donation information secure?',
            answer: 'Yes, we use industry-standard encryption and security protocols to protect your personal and payment information.'
        },
        {
            id: 'panel6',
            question: 'Can I get a tax receipt?',
            answer: 'Yes, tax receipts are automatically generated for all donations. You can download them from your dashboard.'
        },
        {
            id: 'panel7',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit/debit cards, digital wallets, and bank transfers. Choose the payment method that works best for you.'
        },
        {
            id: 'panel8',
            question: 'Can I cancel or modify my donation?',
            answer: 'Once a donation is processed, it cannot be cancelled. However, you can contact our support team for special requests or issues.'
        },
    ];

    return (
        <DonorDrawer currentPage="/donor/faq">
            <Box sx={{ width: '100%', p: { xs: 2, sm: 4 }, maxWidth: '1200px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center' }}>
                    <HelpOutlineIcon sx={{ mr: 2, color: '#2196f3' }} />
                    Frequently Asked Questions
                </Typography>

                <Card elevation={3} sx={{ mb: 4, backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}>
                    <CardContent>
                        <Typography variant="body1" sx={{ color: '#1565c0' }}>
                            Have questions about donating or using our platform? Find answers to common questions below.
                        </Typography>
                    </CardContent>
                </Card>

                <Box sx={{ backgroundColor: '#fff' }}>
                    {faqs.map((faq) => (
                        <Accordion
                            key={faq.id}
                            expanded={expanded === faq.id}
                            onChange={handleChange(faq.id)}
                            sx={{
                                mb: 1,
                                boxShadow: 1,
                                '&:before': {
                                    display: 'none',
                                },
                                borderRadius: '8px',
                                backgroundColor: expanded === faq.id ? '#f5f5f5' : '#fff',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                    backgroundColor: expanded === faq.id ? '#e8eaf6' : '#fff',
                                    '& .MuiAccordionSummary-content': {
                                        my: 2,
                                    },
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: expanded === faq.id ? 'bold' : '600',
                                        color: expanded === faq.id ? '#151c3b' : '#333',
                                    }}
                                >
                                    {faq.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: '#fafafa', pt: 0 }}>
                                <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.8 }}>
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>

                <Card elevation={3} sx={{ mt: 4, backgroundColor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#6a1b9a' }}>
                            Still have questions?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#4a148c' }}>
                            Contact our support team through the Contact Us page or email us directly. We're here to help!
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </DonorDrawer>
    );
};

export default FAQPage;
