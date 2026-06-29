export interface Infraction {
    id: number;
    ticket_number: number;
    plate_type_id: number; 
    plate_number: string;
    plate_detail_id: number; 
    infraction_price_id: number; 
    first_location: string;
    second_location: string;
    third_location: string;
    infraction_state_id: number; 
    registration_date: Date;
    payment_date: Date;
    brand_code_id: number; 
    color_code_id: number; 
    article_code_id: number; 
    clause_code_id: number; 
    vehicule_code_id: number; 
    observations: string;
    latitude: string;
    longitude: string;
    surcharge: number;
    cancellation_description: string;
    inspector_user_id: number; 
  
    infraction_price_price: number;
    plate_type_description: string;
    infraction_state_description: string;
  }