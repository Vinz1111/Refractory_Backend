import express from 'express';
import { Section } from '../models/sectionModel.js';

const router = express.Router();

//Route for Save a new section
router.post('/', async(request, response) => {
    try {
        if (!request.body.name ||!request.body.value ||!request.body.color ) 
            {
        return response.status(400).send({ message: 'Missing information' });
    }

    const newsection = {
        name: request.body.name,
        value: request.body.value,
        color: request.body.color,

    };

    const section = await Section.create(newsection);

    return response.status(201).send(section);

    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Route for Get a Section by name (instead of value)
router.get('/search', async(request, response) => {
    try {
        const { value } = request.query; // Hier bleibt der Query-Parameter 'value', da er vom Frontend kommt
        if (!value) {
            return response.status(400).send({ message: 'Value query parameter is required' });
        }

        // Suche im 'name'-Feld statt im 'value'-Feld
        const section = await Section.find({ name: value });
        if (!section || section.length === 0) {
            return response.status(404).send({ message: 'Section not found' });
        }

        return response.status(200).json(section);
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});


// Route for Get One Section by ID
router.get('/:id', async(request, response) => {
    try {
        const {id} = request.params;
        const section = await Section.findById(id);
        return response.status(200).json(section)
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Route for Get all Sections
router.get('/', async(request, response) => {
    try {
        const sections = await Section.find({});
        return response.status(200).json({
            count: sections.length,
            data: sections,
        });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

// Route for Update a Section
router.put('/:id', async(request, response) => {
    try {
        if(!request.body.key || !request.body.title || !request.body.serializeFragmentIdMap ) {
            return response.status(400).send({ message: 'Missing information' });
        }
        const {id} = request.params;
        const result = await Section.findByIdAndUpdate(id, request.body);
        if(!result) {
            return response.status(404).send({ message: 'Section not found' });
        }
        return response.status(200).send({ message: 'Section updated successfully' });
    } catch (error) {
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }
});

//Route for Delete a Section

router.delete('/:id', async(request, response) => {
    try {
        const {id} = request.params;
        const result = await Section.findByIdAndDelete(id);
        if(!result) {
            return response.status(404).send({ message: 'Section not found' });
        }
        return response.status(200).send({ message: 'Section deleted successfully' });
    } catch (error) {  
        console.log(error.message);
        return response.status(500).send({ message: error.message });
    }  
});

export default router;