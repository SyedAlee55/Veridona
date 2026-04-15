import React, { useState } from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails, Card, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ReceiverDrawer from '../../components/ReceiverDrawer';

const FAQPage = () => {
    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const faqs = [
        {
            id: 'panel1',
            question: 'How do I create a campaign?',
            answer: 'Visit the My Campaigns page and click "Create Campaign". Enter your funding goal and submit. Your campaign will need community votes before it becomes active.'
        },
        {
            id: 'panel2',
            question: 'How do I receive my funds?',
            answer: 'Once your campaign reaches its funding goal, you can click the "Payout" button on your campaign card in the My Campaigns page to trigger a smart contract transfer directly to your wallet.'
        },
        {
            id: 'panel3',
            question: 'What happens if my campaign is disputed?',
            answer: 'If the community raises a dispute against your campaign, it may be halted or reviewed by administrators. Contact support if you believe the dispute is in error.'
        },
        {
            id: 'panel4',
            question: 'Can I have multiple active campaigns?',
            answer: 'Yes, you can create multiple campaigns, but each will need individual community voting before they go live.'
        },
    ];

    return (
        <ReceiverDrawer currentPage="/receiver/faq">
            <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '1000px', mx: 'auto' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center' }}>
                    <HelpOutlineIcon sx={{ mr: 2, color: '#0072ff' }} />
                    Frequently Asked Questions
                </Typography>

                <Card elevation={3} sx={{ mb: 4, backgroundColor: '#e3f2fd', borderLeft: '4px solid #0072ff' }}>
                    <CardContent>
                        <Typography variant="body1" sx={{ color: '#005bb5' }}>
                            Have questions about setting up and managing your campaigns? Find answers below.
                        </Typography>
                    </CardContent>
                </Card>

                <Box sx={{ backgroundColor: '#fff' }}>
                    {faqs.map((faq) => (
                        <Accordion
                            key={faq.id}
                            expanded={expanded === faq.id}
                            onChange={handleChange(faq.id)}
                            sx={{ mb: 1, boxShadow: 1, '&:before': { display: 'none' }, borderRadius: '8px', backgroundColor: expanded === faq.id ? '#f5f5f5' : '#fff' }}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: expanded === faq.id ? '#e8eaf6' : '#fff', '& .MuiAccordionSummary-content': { my: 2 } }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: expanded === faq.id ? 'bold' : '600', color: expanded === faq.id ? '#0072ff' : '#333' }}>
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
            </Box>
        </ReceiverDrawer>
    );
};

export default FAQPage;
