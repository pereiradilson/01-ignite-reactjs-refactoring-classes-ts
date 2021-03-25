import { useEffect, useState } from "react";

import { Header } from "../../components/Header";
import api from "../../services/api";
import { Food } from "../../components/Food";
import { ModalAddFood } from "../../components/ModalAddFood";
import { ModalEditFood } from "../../components/ModalEditFood";
import { FoodsContainer } from "./styles";

interface IFood {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

export function Dashboard() {
  const [foods, setFoods] = useState<IFood[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood);

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get("/foods");

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(food: Omit<IFood, "id" | "available">) {
    try {
      await api
        .post("/foods", {
          ...food,
          available: true,
        })
        .then((response) => {
          setFoods([...foods, response.data]);
        });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: Omit<IFood, "id" | "available">) {
    try {
      await api
        .put(`/foods/${editingFood.id}`, {
          id: editingFood.id,
          name: food.name,
          image: food.image,
          price: food.price,
          description: food.description,
          available: editingFood.available,
        })
        .then((response) => {
          const findIndexFood = foods.findIndex(
            (foodValue) => foodValue.id === response.data.id
          );

          foods[findIndexFood] = response.data;

          setFoods([...foods]);
        });
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {
    console.log("DELETE");

    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter((food) => food.id !== id);

    setFoods(foodsFiltered);
  }

  function toggleModal() {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal() {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFood) {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />

      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />

      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={() => handleDeleteFood(food.id)}
              handleEditFood={() => handleEditFood(food)}
            />
          ))}
      </FoodsContainer>
    </>
  );
}
