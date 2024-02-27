const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.get_user_registration = async (req, res) => {
    try{
        const course_id = parseInt(req.params.id);
        
        if(!course_id){
            res.status(400).send({
                message: "Course ID is required"
            });
            return;
        }

        const user_reg = await prisma.course_reg.findMany({
            select: {
              course_id: true,
              course: { 
                select: {
                  course_name: true
                }
              },
              users_account: {
                select: {
                  prefix: true,
                  first_name: true,
                  last_name: true,
                }
              }
            },
            where: {
              course_id: course_id
            }
          });
        
    }
    catch (error) {
        res.status(500).send({
            message: error.message || "Some error occurred while retrieving user registration."
        });
    }
}
    

                

            




      

       
   




        



   




            



